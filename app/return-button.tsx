"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function ReturnButton({ id }: { id: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);
    try {
      const res = await fetch("/api/checkouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `Server returned ${res.status}`);
        return;
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50"
      >
        {isPending ? "Logging..." : "Log return"}
      </button>
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  );
}
