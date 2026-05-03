# Component D — Testing & Validation

## D.1 — API Contract Test (Open-Meteo)

Open-Meteo does not require authentication, so per the lab manual's note we substitute a **second invalid-input variant** (non-numeric latitude) for the missing-auth case.

The test runner is at `scripts/contract-test.mjs`; results below were captured live by running `node scripts/contract-test.mjs` against `https://api.open-meteo.com/v1/forecast`.

| # | Test Case | Input Description | Expected Outcome | Actual Outcome | Status Code | Pass/Fail |
|---|-----------|-------------------|------------------|----------------|-------------|-----------|
| 1 | Valid input | latitude=47.61, longitude=-122.33, daily=temperature_2m_max | 200 OK with `daily.temperature_2m_max` array | status=200, returned 7 days of forecast data | 200 | **Pass** |
| 2 | Invalid input | latitude=999 (out of -90..90 range) | 400 with error message | status=400, reason="Latitude must be in range of -90 to 90°. Given: 999.0." | 400 | **Pass** |
| 3 | Third invalid variant (no auth required for Open-Meteo) | latitude="abc" (non-numeric) | 400 with error message | status=400, reason="Data corrupted at path ''. Cannot initialize Float from invalid String value abc." | 400 | **Pass** |

## D.2 — External API asserts

Implemented in `lib/asserts.ts` as `assertWeatherShape(data)`, called from `app/api/weather/route.ts:24` immediately after `await res.json()`. It throws on:

- Missing `latitude` / `longitude` numeric fields
- Missing `daily` object
- `daily.time` or `daily.temperature_2m_max` not being arrays
- Length mismatch between `daily.time` and `daily.temperature_2m_max`
- Non-numeric entries inside `daily.temperature_2m_max`

If any assertion fails, the route returns a 502 with the error message — the dashboard then renders a graceful "Weather unavailable" banner without crashing the rest of the page.

## D.3 — Error-handling note (per scenario)

| Scenario | Handled in app? | What the user sees |
|---|---|---|
| Valid input | Yes — happy path | Three-day weather card renders normally |
| Invalid input (out-of-range lat) | Yes | The route never sends a bad request from the dashboard (lat/lon are server-side constants), but if Open-Meteo's contract tightens and our previously-valid input becomes invalid, the 502 fallback renders "Weather unavailable: ..." with the upstream reason |
| Third invalid variant (non-numeric) | Yes | Same as above — `assertWeatherShape` catches malformed responses before they reach the UI |

**Identified gap:** the dashboard surfaces *that* the weather call failed, but it doesn't retry or fall back to a cached forecast. For a production app I would add `next: { revalidate: 600 }` (already done) plus a stale-while-error cache in a follow-up.
