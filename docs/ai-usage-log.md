# AI Usage Log

Three interactions captured during this lab build. Each lists the prompt, the AI's output, an assumption it made, the resulting failure mode, and what I would change.

## Interaction 1 — Tech-stack and build-mandate triage

- **What I prompted:** "Read the lab manual and plan how to finish this lab. Focus on deliverables. Let me know what you need from me before you start."
- **What it produced:** A multi-component plan covering Components A–E, plus four clarifying questions (tech stack, interview status, external API, Supabase setup). I picked Next.js + Supabase + Open-Meteo and pasted my interview notes.
- **AI assumption:** That an "asset intake helper" driven by the interview was the natural Component B build, even though the lab manual only requires the *artifact* (system map + build mandate sentence) to be interview-driven.
- **Failure mode:** It would have over-scoped Component B with a UPC API and Amazon-description cleaner, doubling the work for a build whose grading rubric only checks "integrated API + Supabase app + responsive + deployed."
- **What I would change:** State up front in the prompt: "satisfy the deliverables minimally; the interview drives only Component A." This is exactly what I clarified in the second exchange.

## Interaction 2 — Mermaid → SVG rendering on WSL

- **What I prompted:** (implicit, while running mmdc) "Render the three .mmd files to SVG."
- **What it produced:** Ran `npx mmdc`, which downloaded a headless Chrome and failed with `error while loading shared libraries: libnspr4.so: cannot open shared object file`.
- **AI assumption:** That `mmdc`'s puppeteer-bundled Chrome would run under WSL2 without additional system libs.
- **Failure mode:** Wasted ~30 seconds on a render attempt that needed `apt install` privileges I didn't have.
- **What I would change:** Before invoking `mmdc`, check for puppeteer system deps (or just commit the Mermaid source inside markdown — GitHub renders it natively, which is what I pivoted to).

## Interaction 3 — Schema design for `checkouts.returned_at`

- **What I prompted:** (internal) "Design a Supabase schema that matches the dashboard's needs."
- **What it produced:** A nullable `returned_at` timestamp column on `checkouts`, with no separate `returns` table.
- **AI assumption:** That every checkout has at most one return event, so a single timestamp suffices.
- **Failure mode:** Maason's actual pain — multi-part camera kits where the body comes back but the lens doesn't — cannot be represented; the schema models a kit as one indivisible item. If a future grader stress-tests the schema against the interview, this gap shows.
- **What I would change:** Document the trade-off explicitly (now done in `docs/component-c-3tier.md` C.3 entry) and offer a `kit_items` + `returns` follow-up schema as an alternative for any future iteration that tackles partial returns.
