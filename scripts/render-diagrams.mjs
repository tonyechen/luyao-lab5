// Render the .mmd files in docs/diagrams/ to .svg via kroki.io.
// kroki accepts a JSON body of { diagram_source, diagram_type, output_format }
// and returns the rendered diagram in the response body.
//
// Run: node scripts/render-diagrams.mjs
//
// Why kroki: the local mmdc CLI relies on puppeteer's bundled Chrome, which
// needs system libs (libnspr4, libnss3, ...) that aren't available in this
// WSL environment without sudo. kroki is a public Mermaid renderer that
// accepts an HTTP POST and returns SVG, so it works without local Chrome.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const diagramsDir = join(here, "..", "docs", "diagrams");

const files = readdirSync(diagramsDir).filter((f) => f.endsWith(".mmd"));
if (files.length === 0) {
  console.error(`No .mmd files found in ${diagramsDir}`);
  process.exit(1);
}

let failed = 0;
for (const name of files) {
  const src = readFileSync(join(diagramsDir, name), "utf8");
  const outName = name.replace(/\.mmd$/, ".svg");
  const outPath = join(diagramsDir, outName);

  try {
    const res = await fetch("https://kroki.io/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        diagram_source: src,
        diagram_type: "mermaid",
        output_format: "svg",
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`FAIL ${name}: ${res.status} ${body.slice(0, 300)}`);
      failed += 1;
      continue;
    }
    const svg = await res.text();
    writeFileSync(outPath, svg);
    console.log(`OK   ${name} -> ${outName} (${svg.length} bytes)`);
  } catch (err) {
    console.error(`FAIL ${name}: ${err instanceof Error ? err.message : err}`);
    failed += 1;
  }
}

if (failed) process.exitCode = 1;
