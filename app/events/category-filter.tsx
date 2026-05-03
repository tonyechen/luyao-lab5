"use client";

import Link from "next/link";

type Props = {
  selected: string;
  categories: readonly string[];
};

export function CategoryFilter({ selected, categories }: Props) {
  const options = ["all", ...categories];
  return (
    <nav
      aria-label="Filter events by category"
      className="mb-4 flex flex-wrap gap-2"
    >
      {options.map((c) => {
        const href = c === "all" ? "/events" : `/events?category=${c}`;
        const active = selected === c;
        return (
          <Link
            key={c}
            href={href}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              active
                ? "bg-zinc-900 text-white"
                : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {c}
          </Link>
        );
      })}
    </nav>
  );
}
