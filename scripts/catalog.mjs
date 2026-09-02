#!/usr/bin/env node
/**
 * Каталог монорепо — единственный источник правды о числах (серверы / версии / tools).
 *
 * Tools считаются ЖИВЬЁМ: сервер поднимается через stdio и отвечает на listTools().
 * Статический подсчёт (греп по registerTool) врёт:
 *   - wildberries регистрирует тулы в цикле по toolDefinitions → греп даёт 3 при реальных 30;
 *   - huntflow использует свои обёртки registerStructured / registerText;
 *   - retailcrm зависит от isReadonly(), aprovodka — от ONEC_SERVICES / ONEC_WRITE_MODE.
 *
 * Режимы:
 *   node scripts/catalog.mjs                 перегенерировать scripts/catalog.json
 *   node scripts/catalog.mjs --check         только проверить дрейф, exit 1 если есть
 *   node scripts/catalog.mjs --write-readme  дополнительно вписать числа в README/docs
 *
 * Серверы пишут свои логи в stderr — для чистого вывода добавь 2>/dev/null.
 */

import { readdirSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, join } from "node:path";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const CATALOG_JSON = join(ROOT, "scripts", "catalog.json");
const CONCURRENCY = 6;

const argv = new Set(process.argv.slice(2));
const CHECK = argv.has("--check");
const WRITE_README = argv.has("--write-readme");

/** Серверы, у которых набор тулов зависит от env — считаем с дефолтами и помечаем в выводе. */
const ENV_DEPENDENT = new Set(["aprovodka", "retailcrm"]);

/**
 * Env-переменные, меняющие ПОВЕДЕНИЕ (транспорт, набор тулов, sandbox), не подставляем —
 * чтобы каталог отражал конфигурацию по умолчанию. Всё остальное (креды) получает заглушку,
 * иначе сервер падает на старте и до listTools дело не доходит.
 */
const BEHAVIOUR_ENV =
  /^(PORT|HOST|HTTP_PORT|HTTP_HOST|NODE_ENV|LOG_LEVEL|MCP_.*)$|_(SANDBOX|TEST|DEBUG|READONLY|WRITE_MODE|SERVICES|SCOPE|COUNTRY|USER_AGENT|TOKEN_FILE|ALLOW_RAW|RATE_LIMIT|MAX_CONCURRENCY|DNS_PROTECTION|ALLOWED_HOSTS|ALLOWED_ORIGINS|AUDIT_LOG|AUDIT_ACTOR|APPROVAL_TTL_SEC)$|_(TIMEOUT|BACKOFF|DISABLE)/;

const stubValue = (name) =>
  /_URL$/.test(name)
    ? "https://example.test"
    : /(_DOMAIN|_HOST|_ENDPOINT_ID)$/.test(name)
      ? "example.test"
      : "test";

const srcFiles = (dir) => {
  const src = join(ROOT, "servers", dir, "src");
  if (!existsSync(src)) return [];
  return readdirSync(src, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => join(src, f));
};

/** Заглушки для кредов: имена вытаскиваем из кода сервера, руками карту не ведём. */
function stubEnv(dir) {
  const names = new Set();
  for (const file of srcFiles(dir)) {
    const src = readFileSync(file, "utf8");
    const re = /process\.env\.([A-Z][A-Z0-9_]*)|process\.env\[["']([A-Za-z0-9_]+)["']\]/g;
    for (const m of src.matchAll(re)) names.add(m[1] ?? m[2]);
  }
  const env = {};
  for (const n of names) if (!BEHAVIOUR_ENV.test(n)) env[n] = stubValue(n);
  return env;
}

/** Объявленная TOOL_COUNT — только числовой литерал (производные TOOLS.length дрейфовать не могут). */
function declaredToolCount(dir) {
  for (const file of srcFiles(dir)) {
    const m = readFileSync(file, "utf8").match(/\bTOOL_COUNT\s*=\s*(\d+)\s*;/);
    if (m) return Number(m[1]);
  }
  return null;
}

async function pool(items, fn) {
  const queue = [...items];
  const out = [];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
        out.push(await fn(item));
      }
    }),
  );
  return out;
}

// --- сбор -------------------------------------------------------------------

const dirs = readdirSync(join(ROOT, "servers"), { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== "_template")
  .map((d) => d.name)
  .sort();

const missingBuild = dirs.filter((d) => !existsSync(join(ROOT, "servers", d, "dist", "index.js")));
if (missingBuild.length) {
  console.error(`Нет dist/index.js у ${missingBuild.length} серверов: ${missingBuild.join(", ")}`);
  console.error("Сначала выполни pnpm build.");
  process.exit(1);
}

const { runSmokeTest } = await import(
  pathToFileURL(join(ROOT, "packages", "core", "dist", "testing", "smoke.js")).href
);

const entries = (
  await pool(dirs, async (dir) => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "servers", dir, "package.json"), "utf8"));
    const smoke = await runSmokeTest({
      serverPath: join(ROOT, "servers", dir, "dist", "index.js"),
      expectedToolCount: 0,
      env: stubEnv(dir),
      timeout: 20_000,
    });
    return {
      dir,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description ?? "",
      connected: smoke.connected,
      toolCount: smoke.connected ? smoke.toolCount : null,
      tools: smoke.tools.map((t) => t.name).sort(),
      declaredToolCount: declaredToolCount(dir),
      envDependent: ENV_DEPENDENT.has(dir),
      shortDescriptions: smoke.tools.filter((t) => t.descriptionLength < 20).map((t) => t.name),
      error: smoke.connected ? null : (smoke.errors[0] ?? "unknown"),
    };
  })
).sort((a, b) => a.dir.localeCompare(b.dir));

const ok = entries.filter((e) => e.connected);
const failed = entries.filter((e) => !e.connected);
const catalog = {
  generatedAt: new Date().toISOString(),
  servers: entries.length,
  serversConnected: ok.length,
  totalTools: ok.reduce((s, e) => s + e.toolCount, 0),
  entries,
};

// --- расхождения ------------------------------------------------------------

const drift = [];

for (const e of ok) {
  if (e.declaredToolCount !== null && e.declaredToolCount !== e.toolCount) {
    drift.push(
      `TOOL_COUNT ${e.dir}: объявлено ${e.declaredToolCount}, listTools() вернул ${e.toolCount}`,
    );
  }
}
for (const e of failed) drift.push(`${e.dir}: сервер не поднялся — ${e.error}`);

// Документация: правим ТОЛЬКО строки, где пакет реально есть в servers/.
// Остальные ~77 строк каталога — standalone-репо вне монорепы, их не трогаем.
const byPkg = new Map(ok.map((e) => [e.name, e]));
const DOC_FILES = ["README.md", "README.ru.md", "docs/index.html"];

const patchLine = (line, e) =>
  line.includes('class="tools-num"')
    ? line.replace(/(class="tools-num">)\d+(<)/, `$1${e.toolCount}$2`)
    : line
        .replace(/\| v[\d.]+ \|/, `| v${e.version} |`)
        .replace(/\| \d+ tools \|/, `| ${e.toolCount} tools |`);

const docChanges = [];
for (const rel of DOC_FILES) {
  const path = join(ROOT, rel);
  if (!existsSync(path)) continue;
  const lines = readFileSync(path, "utf8").split("\n");
  let changed = false;
  const next = lines.map((line, i) => {
    const m = line.match(/@theyahia\/[a-z0-9-]+-mcp/);
    const e = m && byPkg.get(m[0]);
    if (!e) return line;
    const patched = patchLine(line, e);
    if (patched !== line) {
      changed = true;
      docChanges.push({ file: rel, line: i + 1, from: line.trim(), to: patched.trim() });
    }
    return patched;
  });
  if (changed && WRITE_README && !CHECK) writeFileSync(path, next.join("\n"));
}
for (const rel of DOC_FILES) {
  const n = docChanges.filter((c) => c.file === rel).length;
  if (n) drift.push(`${rel}: устаревшие числа в ${n} строк(ах)`);
}

// catalog.json устарел?
const strip = ({ generatedAt, ...rest }) => JSON.stringify(rest);
const stale =
  !existsSync(CATALOG_JSON) ||
  strip(JSON.parse(readFileSync(CATALOG_JSON, "utf8"))) !== strip(catalog);
if (stale) drift.push("scripts/catalog.json устарел (перегенерировать: node scripts/catalog.mjs)");

// --- вывод ------------------------------------------------------------------

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nСерверов: ${entries.length} · поднялось: ${ok.length} · tools: ${catalog.totalTools}\n`);
for (const e of entries) {
  const count = e.connected ? `${e.toolCount} tools` : "НЕ ПОДНЯЛСЯ";
  const note = e.envDependent ? " (при настройках по умолчанию)" : "";
  console.log(`  ${pad(e.dir, 18)} ${pad("v" + e.version, 10)} ${count}${note}`);
}

if (docChanges.length) {
  console.log(`\nЧисла в документации разошлись (${docChanges.length} строк):`);
  for (const c of docChanges) {
    console.log(`  ${c.file}:${c.line}`);
    console.log(`    - ${c.from}`);
    console.log(`    + ${c.to}`);
  }
  console.log(
    WRITE_README && !CHECK ? "  → записано." : "  → не записано (нужен флаг --write-readme).",
  );
}

if (drift.length) {
  console.log(`\nРасхождения (${drift.length}):`);
  for (const d of drift) console.log(`  · ${d}`);
} else {
  console.log("\nРасхождений нет.");
}

if (!CHECK) {
  writeFileSync(CATALOG_JSON, JSON.stringify(catalog, null, 2) + "\n");
  console.log("\nЗаписано: scripts/catalog.json");
}

process.exit(CHECK && drift.length ? 1 : 0);
