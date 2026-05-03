// Component D: contract test for the Open-Meteo external API.
// Run: node scripts/contract-test.mjs (or `npm run contract-test`)
//
// Three scenarios:
//   1. Valid input        — Seattle lat/lon
//   2. Invalid input      — latitude out of range (999)
//   3. Third invalid var. — non-numeric latitude (Open-Meteo has no auth, so we test
//                            another invalid-input variant per the lab manual's note)

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

const cases = [
  {
    name: "Valid input",
    description: "Seattle lat 47.61 / lon -122.33, daily forecast",
    expected: "200 OK with `daily.temperature_2m_max` array",
    params: { latitude: 47.61, longitude: -122.33, daily: "temperature_2m_max" },
    check: (status, body) =>
      status === 200 &&
      Array.isArray(body?.daily?.temperature_2m_max) &&
      body.daily.temperature_2m_max.length > 0,
  },
  {
    name: "Invalid input",
    description: "latitude=999 (out of range -90..90)",
    expected: "400 with error message",
    params: { latitude: 999, longitude: -122.33, daily: "temperature_2m_max" },
    check: (status, body) => status === 400 && typeof body?.reason === "string",
  },
  {
    name: "Third invalid variant",
    description: "latitude='abc' (non-numeric)",
    expected: "400 with error message (no auth required, so we test a 2nd invalid form)",
    params: { latitude: "abc", longitude: -122.33, daily: "temperature_2m_max" },
    check: (status, body) => status === 400 && typeof body?.reason === "string",
  },
];

function buildUrl(params) {
  const url = new URL(ENDPOINT);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  return url.toString();
}

async function run() {
  const results = [];
  for (const c of cases) {
    const url = buildUrl(c.params);
    let status = 0;
    let body = null;
    let error = null;
    try {
      const res = await fetch(url);
      status = res.status;
      body = await res.json().catch(() => null);
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
    const pass = !error && c.check(status, body);
    results.push({
      name: c.name,
      description: c.description,
      expected: c.expected,
      actual: error
        ? `network error: ${error}`
        : `status=${status}` +
          (body?.reason ? ` reason="${body.reason}"` : "") +
          (Array.isArray(body?.daily?.temperature_2m_max)
            ? ` days=${body.daily.temperature_2m_max.length}`
            : ""),
      status,
      pass,
    });
  }

  console.log("\nComponent D — Open-Meteo Contract Test\n");
  console.log(
    "| # | Test Case | Input | Expected | Actual | Status | Pass |"
  );
  console.log(
    "|---|-----------|-------|----------|--------|--------|------|"
  );
  results.forEach((r, i) => {
    console.log(
      `| ${i + 1} | ${r.name} | ${r.description} | ${r.expected} | ${r.actual} | ${r.status} | ${
        r.pass ? "Pass" : "FAIL"
      } |`
    );
  });
  console.log();
  const allPass = results.every((r) => r.pass);
  if (!allPass) process.exitCode = 1;
}

run();
