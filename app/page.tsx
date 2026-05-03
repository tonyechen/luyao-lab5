import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ReturnButton } from "./return-button";

type Checkout = {
  id: string;
  student_name: string;
  item: string;
  checked_out_at: string;
  due_at: string;
  returned_at: string | null;
};

type WeatherDay = { date: string; max: number; min: number };

async function fetchCheckouts(): Promise<{ rows: Checkout[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("checkouts")
      .select("*")
      .order("due_at", { ascending: true });
    if (error) return { rows: [], error: error.message };
    return { rows: (data as Checkout[]) ?? [], error: null };
  } catch (err) {
    return { rows: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

async function fetchWeather(): Promise<{ days: WeatherDay[]; error: string | null }> {
  try {
    // Build absolute URL for server-side fetch in Next.js
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/weather`, { next: { revalidate: 600 } });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { days: [], error: body?.error ?? `Weather API returned ${res.status}` };
    }
    const json = await res.json();
    return { days: (json.days as WeatherDay[]) ?? [], error: null };
  } catch (err) {
    return { days: [], error: err instanceof Error ? err.message : "Unknown error" };
  }
}

function classifyStatus(c: Checkout): "returned" | "overdue" | "due-soon" | "ok" {
  if (c.returned_at) return "returned";
  const dueMs = new Date(c.due_at).getTime();
  const now = Date.now();
  if (dueMs < now) return "overdue";
  if (dueMs - now < 1000 * 60 * 60 * 24 * 3) return "due-soon";
  return "ok";
}

const statusStyles: Record<string, string> = {
  returned: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  "due-soon": "bg-amber-100 text-amber-900",
  ok: "bg-zinc-100 text-zinc-800",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ rows, error: dbError }, { days, error: wxError }] = await Promise.all([
    fetchCheckouts(),
    fetchWeather(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold sm:text-3xl">GIX Equipment Checkouts</h1>
            <p className="text-sm text-zinc-600">
              Component B dashboard &middot; Supabase + Open-Meteo
            </p>
          </div>
          <Link
            href="/events"
            className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 sm:w-auto"
          >
            Component E: Events &rarr;
          </Link>
        </header>

        <section className="mb-8 rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-medium">Seattle weather (return-day planning)</h2>
          {wxError ? (
            <p className="text-sm text-red-700">
              Weather unavailable: {wxError}. The rest of the dashboard still works.
            </p>
          ) : days.length === 0 ? (
            <p className="text-sm text-zinc-600">No forecast data.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {days.map((d) => (
                <li
                  key={d.date}
                  className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm"
                >
                  <div className="font-medium">{d.date}</div>
                  <div className="text-zinc-700">
                    Hi {Math.round(d.max)}&deg;C &middot; Lo {Math.round(d.min)}&deg;C
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6">
          <h2 className="mb-3 text-lg font-medium">Active &amp; returned checkouts</h2>
          {dbError ? (
            <p className="text-sm text-red-700">
              Could not load checkouts: {dbError}. Check Supabase connection in `.env.local`.
            </p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No rows yet. Run <code>scripts/schema.sql</code> in Supabase to seed sample data.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {rows.map((c) => {
                const status = classifyStatus(c);
                return (
                  <li
                    key={c.id}
                    className="flex flex-col gap-2 rounded-md border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{c.item}</div>
                      <div className="text-sm text-zinc-600">
                        {c.student_name} &middot; due {new Date(c.due_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
                      >
                        {status}
                      </span>
                      {!c.returned_at && <ReturnButton id={c.id} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="mt-8 text-xs text-zinc-500">
          Tier 1 (this browser) &harr; Tier 2 (Next.js API routes) &harr; Tier 3 (Supabase Postgres)
          &middot; External API: Open-Meteo
        </footer>
      </main>
    </div>
  );
}
