import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { assertEventShape, assertEventsArray, type EventRow } from "@/lib/asserts";
import { CategoryFilter } from "./category-filter";

const CATEGORIES = ["lecture", "workshop", "career", "social"] as const;
type Category = (typeof CATEGORIES)[number];

type FetchResult = {
  rows: EventRow[];
  skipped: number;
  error: string | null;
};

async function fetchEvents(): Promise<FetchResult> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error) {
      return { rows: [], skipped: 0, error: error.message };
    }
    // Component E assert #1: query returned an array
    assertEventsArray(data);
    // Component E assert #2: every row matches expected shape — skip malformed rows gracefully
    const rows: EventRow[] = [];
    let skipped = 0;
    for (const row of data) {
      try {
        assertEventShape(row);
        rows.push(row);
      } catch {
        skipped += 1;
      }
    }
    return { rows, skipped, error: null };
  } catch (err) {
    return {
      rows: [],
      skipped: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export const dynamic = "force-dynamic";

type SearchParams = { category?: string };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selected: Category | "all" =
    params.category && (CATEGORIES as readonly string[]).includes(params.category)
      ? (params.category as Category)
      : "all";

  const { rows, skipped, error } = await fetchEvents();
  const filtered =
    selected === "all" ? rows : rows.filter((r) => r.category === selected);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">GIX Events</h1>
            <p className="text-sm text-zinc-600">
              Component E &middot; browse upcoming events by category
            </p>
          </div>
          <Link href="/" className="text-sm text-zinc-600 hover:underline">
            &larr; Back to dashboard
          </Link>
        </header>

        <CategoryFilter selected={selected} categories={CATEGORIES} />

        {/* Error mode 1: Supabase unreachable / rejected query */}
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <strong>Could not load events.</strong> {error}
            <div className="mt-1 text-xs">
              Check that <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
              <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are set, and that the{" "}
              <code>events</code> table exists with RLS off.
            </div>
          </div>
        )}

        {/* Error mode 2: malformed rows skipped */}
        {skipped > 0 && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            Skipped {skipped} malformed event row{skipped === 1 ? "" : "s"} that did not match the
            expected schema.
          </div>
        )}

        {/* Error mode 3: empty result */}
        {!error && filtered.length === 0 ? (
          <div className="rounded-md border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-600">
            {rows.length === 0 ? (
              <>
                No events yet. Run <code>scripts/schema.sql</code> in Supabase to seed sample data.
              </>
            ) : (
              <>No events in the &quot;{selected}&quot; category. Try a different filter.</>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((e) => (
              <li
                key={e.id}
                className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-zinc-700">
                    {e.category}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {new Date(e.starts_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <h3 className="font-semibold">{e.title}</h3>
                {e.description && (
                  <p className="mt-1 text-sm text-zinc-600">{e.description}</p>
                )}
                {e.location && (
                  <p className="mt-2 text-xs text-zinc-500">{e.location}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
