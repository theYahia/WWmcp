// Shared helpers for catalog tooling: npm registry, download stats, tool counting.
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

export const SCOPE = "theyahia";

/**
 * Registry fetch with retries. A single flaky connection must not kill a
 * multi-minute refresh over 134 packages.
 */
async function json(url, attempts = 4) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(30_000),
      });
      if (res.status === 404) return null;
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 1500 * i));
        throw new Error("HTTP 429");
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === attempts) {
        console.error(`  ! ${url} failed after ${attempts} attempts: ${err.message}`);
        return null;
      }
      await new Promise((r) => setTimeout(r, 400 * 2 ** (i - 1)));
    }
  }
  return null;
}

/** All packages owned by the npm org, as a sorted list of names. */
export async function listScopePackages() {
  const data = await json(`https://registry.npmjs.org/-/org/${SCOPE}/package`);
  if (!data) throw new Error(`npm org listing failed for @${SCOPE}`);
  return Object.keys(data).sort();
}

/** Latest published version, publish time, repo url and tarball for one package. */
export async function packageMeta(name) {
  const doc = await json(`https://registry.npmjs.org/${name.replace("/", "%2f")}`);
  if (!doc || doc.error) return { name, exists: false };
  const version = doc["dist-tags"]?.latest;
  const v = doc.versions?.[version] ?? {};
  return {
    name,
    exists: true,
    version,
    modified: doc.time?.modified?.slice(0, 10),
    published: doc.time?.[version]?.slice(0, 10),
    description: v.description ?? "",
    repository: typeof v.repository === "string" ? v.repository : v.repository?.url ?? "",
    mcpName: v.mcpName ?? null,
    tarball: v.dist?.tarball ?? null,
    unpackedSize: v.dist?.unpackedSize ?? null,
    license: v.license ?? null,
  };
}

// api.npmjs.org rate-limits far more aggressively than the registry itself,
// so downloads are fetched through a single-flight queue with a small gap.
let downloadChain = Promise.resolve();
export function weeklyDownloads(name) {
  const run = downloadChain.then(async () => {
    await new Promise((r) => setTimeout(r, 120));
    const d = await json(`https://api.npmjs.org/downloads/point/last-week/${name}`, 5);
    return d?.downloads ?? null;
  });
  downloadChain = run.catch(() => {});
  return run;
}

const TOOL_NAME = /^[a-z][a-z0-9_]{2,49}$/;

/**
 * Count tools in a PUBLISHED tarball rather than trusting a hand-written README.
 * Servers register tools three different ways across this fleet, so we take the
 * union of all three and report which evidence we found.
 */
/**
 * Count the tools in a bundled MCP server. Pure so it can be unit-tested
 * offline; see npm.test.mjs for the three real-world registration shapes.
 */
export function countToolsInBundle(code) {
  const names = new Set();
  const add = (re) => {
    for (const m of code.matchAll(re)) if (TOOL_NAME.test(m[1])) names.add(m[1]);
  };
  // 1. server.tool("name", ...) — the classic SDK call
  add(/\.tool\(\s*["']([^"']+)["']/g);
  // 2. server.registerTool("name", ...) — the current SDK call
  add(/registerTool\(\s*["']([^"']+)["']/g);
  // 3. a table of { name: "x", description, ... } registered in a loop
  add(/name:\s*["']([^"']+)["']\s*,/g);
  // 4. a keyed object literal: `list_products: { description, inputSchema }`.
  //    Anchor on the block's FIRST field — a nested JSON-Schema property opens
  //    with `type`, and without the anchor its window slides into the next
  //    tool's inputSchema and over-counts.
  const objTool = /(?:^|[{,\s])([a-z][a-z0-9_]{3,49})\s*:\s*\{\s*(?:description|inputSchema|input_schema|title)\s*:/g;
  for (const m of code.matchAll(objTool)) {
    if (!TOOL_NAME.test(m[1])) continue;
    if (/\binput_?[Ss]chema\s*:/.test(code.slice(m.index, m.index + 400))) names.add(m[1]);
  }

  const declared = code.match(/toolCount:\s*(\d+)/);
  const declaredCount = declared ? Number(declared[1]) : null;
  const scanned = names.size;
  return {
    tools: scanned > 0 ? scanned : declaredCount,
    scanned,
    declared: declaredCount,
    names: [...names].sort(),
    method: scanned > 0 ? "scan" : declaredCount != null ? "declared" : "unknown",
    mismatch: declaredCount != null && scanned > 0 && declaredCount !== scanned,
  };
}

/**
 * Count tools in a PUBLISHED tarball rather than trusting a hand-written README.
 */
export async function countPublishedTools(tarball) {
  if (!tarball) return { tools: null, method: "none" };
  let code;
  try {
    const { stdout } = await exec("bash", [
      "-c",
      `curl -sL --max-time 90 ${JSON.stringify(tarball)} | tar -xzO 'package/dist/*' 2>/dev/null`,
    ], { maxBuffer: 64 * 1024 * 1024 });
    code = stdout;
  } catch {
    return { tools: null, method: "fetch-failed" };
  }
  if (!code) return { tools: null, method: "empty-dist" };
  const r = countToolsInBundle(code);
  delete r.names;
  return r;
}

/** Every server this npm account has published to the official MCP Registry. */
export async function mcpRegistryEntries() {
  const out = new Map();
  let cursor = "";
  for (let page = 0; page < 20; page++) {
    const url = `https://registry.modelcontextprotocol.io/v0/servers?search=theYahia&version=latest&limit=100${cursor ? `&cursor=${cursor}` : ""}`;
    const d = await json(url);
    const rows = d?.servers ?? [];
    for (const row of rows) {
      const s = row.server ?? row;
      for (const pkg of s.packages ?? []) {
        if (pkg.registryType !== "npm") continue;
        out.set(pkg.identifier, { registryName: s.name, registryVersion: pkg.version ?? s.version });
      }
      if (!(s.packages ?? []).length) out.set(`@@remote:${s.name}`, { registryName: s.name, registryVersion: s.version });
    }
    cursor = d?.metadata?.nextCursor ?? "";
    if (!cursor) break;
  }
  return out;
}

/** Run async work with a concurrency cap so we stay polite to the registries. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return results;
}
