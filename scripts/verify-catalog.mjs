#!/usr/bin/env node
/**
 * Assert the catalog still matches the npm registry.
 *
 * This is the check that would have caught all of it: 112 wrong version rows,
 * a package advertised for months that was never published, and tool counts
 * inflated 3x. Cheap enough to run on every push to main.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { packageMeta, mapLimit } from "./lib/npm.mjs";

const ROOT = new URL("..", import.meta.url).pathname;

const servers = [];
let cur = null;
for (const line of readFileSync(join(ROOT, "catalog/servers.yaml"), "utf8").split("\n")) {
  if (line.startsWith("  - package: ")) { cur = { package: line.slice(13).trim() }; servers.push(cur); continue; }
  const m = cur && line.match(/^    ([A-Za-z]+): (.*)$/);
  if (m) cur[m[1]] = m[2].trim().replace(/^"|"$/g, "");
}

const problems = [];
await mapLimit(servers, 8, async (s) => {
  const meta = await packageMeta(s.package);
  if (!meta.exists) return problems.push(`${s.package}: advertised but NOT PUBLISHED on npm`);
  if (meta.version !== s.npmVersion) {
    problems.push(`${s.package}: catalog says v${s.npmVersion}, npm has v${meta.version}`);
  }
});

if (problems.length) {
  console.error(`Catalog is out of date in ${problems.length} place(s):\n  ` + problems.join("\n  "));
  console.error("\nRun: node scripts/catalog-refresh.mjs && node scripts/gen-catalog.mjs");
  process.exit(1);
}
console.log(`✓ all ${servers.length} catalog entries match npm`);
