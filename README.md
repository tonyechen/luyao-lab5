# TECHIN 510 — Week 5 Lab: APIs, Databases & Full-Stack Transition

Next.js 16 (App Router) + Supabase + Open-Meteo, deployed to Vercel.

- **Live deploy:** _add your Vercel URL here after the Import step below_
- **Lab manual:** [`lab-manual.md`](./lab-manual.md)
- **Repo plan:** see commit history; planning notes in `/home/.../plans/` (local).

---

## Deliverable index

| Component | What | Where |
|---|---|---|
| A — Interview + system map | Build mandate, interview notes, system map (with pain points circled + 2 annotated touchpoints) | [`docs/component-a.md`](./docs/component-a.md) |
| B — Lab app | Tech-stack justification, schema, responsive results, deploy URL, security checklist | this README + [`scripts/schema.sql`](./scripts/schema.sql) + `app/page.tsx` |
| C — 3-tier diagram + decision log | C.2 diagram, C.3 schema decision | [`docs/component-c-3tier.md`](./docs/component-c-3tier.md) |
| D — Contract tests + asserts | 3-scenario test results, external-API asserts, error-handling note | [`docs/component-d-validation.md`](./docs/component-d-validation.md) + [`scripts/contract-test.mjs`](./scripts/contract-test.mjs) + [`lib/asserts.ts`](./lib/asserts.ts) |
| E — Events connector | Working `/events` UI, separate architecture map, 3 in-app errors handled, 2 events asserts, 3 error-scenario tests, security note | [`docs/component-e.md`](./docs/component-e.md) + `app/events/page.tsx` |
| AI Usage Log | 3 interactions w/ assumption + failure mode | [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) |
| Reflection | 3–5 sentences | [`docs/reflection.md`](./docs/reflection.md) |

---

## Component B — Tech stack & schema

### Tech-stack justification (1 sentence — also the Spec Checkpoint entry)

> I chose **Next.js + Supabase** because the equipment-checkout workflow has multiple users (IT + Maker Space staff), requires data persistence across sessions (returns logged today must show up tomorrow), and benefits from URL-shareable filtered views (e.g., `/events?category=workshop`) — all things Streamlit makes harder.

### Supabase schema report

Two tables, both seeded by [`scripts/schema.sql`](./scripts/schema.sql). RLS off (lab manual explicitly says this is fine for Lab 5).

**`checkouts`**

| column | type | notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `student_name` | text | not null |
| `item` | text | not null |
| `checked_out_at` | timestamptz | default `now()` |
| `due_at` | timestamptz | not null |
| `returned_at` | timestamptz | nullable — sentinel for "still out" |

**`events`**

| column | type | notes |
|---|---|---|
| `id` | uuid pk | `gen_random_uuid()` |
| `title` | text | not null |
| `description` | text | nullable |
| `category` | text | check constraint: `lecture` / `workshop` / `career` / `social` |
| `starts_at` | timestamptz | not null |
| `location` | text | nullable |

### Responsive Design Check (iPhone 14 Pro width)

| Element | Works at phone width? | What broke / what I fixed |
|---|---|---|
| Page title | Yes | — |
| Navigation (link to `/events`) | Yes (after fix) | The "Component E: Events" link was a horizontal pill that overflowed on narrow viewports; switched to `w-full` on `< sm` and `w-auto` from `sm` up |
| Forms / "Log return" button | Yes | — |
| Tables / lists | Yes (after fix) | Originally a horizontal flex row of (name, item, due, status, button) → wrapped to a 2-row card layout with `flex-col sm:flex-row` |
| Charts | n/a | No charts in this app |
| Buttons (tap target size) | Yes | All buttons ≥ 32px |
| Text size | Yes | Default Tailwind `text-sm` / `text-base` is readable |

**Most critical issue + fix:** the checkout list was a single-row flex layout that pushed the "Log return" button off-screen on iPhone 14 Pro width. Switched the row to `flex-col gap-2 sm:flex-row sm:items-center sm:justify-between` so each row stacks vertically on phone and goes side-by-side from the `sm` breakpoint up. The events grid uses `grid-cols-1 sm:grid-cols-2` for the same reason.

### Security Checklist

- [x] **No hardcoded secrets in source** — keys live in `.env.local` only; verified with `git grep -nE "sb_publishable_|sb_secret_|eyJ[A-Za-z0-9_-]{20,}"` (only matches in `.env.local`, `.env.local.example`, and this README's "Grading Submission" section).
- [x] **`.env.local` is in `.gitignore`** — see [`.gitignore`](./.gitignore) line 33–37.
- [x] **Error handling on every API call and DB op** — every fetch and Supabase call is wrapped in try/catch; failures render user-visible banners instead of crashing (see `app/page.tsx:18-46`, `app/events/page.tsx:14-44`, `app/api/weather/route.ts:18-37`, `app/api/checkouts/route.ts:6-23`).

---

## Grading Submission — Supabase keys

The lab manual explicitly says: _"For grading purpose, please submit the secrets. In the future, do not expose the secrets."_ Per that instruction, the values needed to run this app are below. **Note that `sb_publishable_*` is Supabase's new client-side rotatable key (analogous to the legacy anon JWT) — it is designed to be exposed to browsers and cannot bypass RLS.**

```
NEXT_PUBLIC_SUPABASE_URL=https://ukhmbhxinpfuovmixmja.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FUUXwxtKrQPhM2zxsjo4xg_iCkPFU5L
```

---

## Run locally

```bash
# 1. install deps
npm install

# 2. seed Supabase: paste scripts/schema.sql into the Supabase SQL editor and click Run.
#    URL: https://supabase.com/dashboard/project/ukhmbhxinpfuovmixmja/sql
#    Then for each of `checkouts` and `events`: shield icon -> RLS OFF.

# 3. dev server
npm run dev          # -> http://localhost:3000
                     # -> http://localhost:3000/events

# 4. Component D contract test
npm run contract-test
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to https://vercel.com/new and **Import** the repo.
3. In **Environment Variables**, paste:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://ukhmbhxinpfuovmixmja.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FUUXwxtKrQPhM2zxsjo4xg_iCkPFU5L
   ```
4. Click **Deploy**. Once it finishes, paste the URL into the "Live deploy" line at the top of this README.
