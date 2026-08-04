#!/usr/bin/env node
/**
 * Собрать MCPB-бандл (`.mcpb`) — единственный путь публикации stdio-сервера
 * на Smithery: `smithery.yaml` со `startCommand` платформой больше не читается
 * (см. docs/checklist-2026-08-04/smithery.md §C).
 *
 * Бандл self-contained: внутрь кладутся dist/ и продовые node_modules, поэтому
 * запускать ПОСЛЕ `pnpm build`. Список инструментов в манифесте берётся из
 * живого сервера через tools/list, а не переписывается руками — иначе он
 * разъедется с кодом ровно так же, как разъезжался счётчик инструментов.
 *
 *   node scripts/build-mcpb.mjs
 *   → mcpb/aprovodka-<version>.mcpb
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, cpSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "dist", "..", "package.json"), "utf8"));

// --- список инструментов из живого сервера -------------------------------
async function liveTools() {
  const { createServer } = await import(pathToFileURL(join(root, "dist", "server.js")).href);
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");
  const server = createServer();
  const [ct, st] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "mcpb-build", version: "0" });
  await Promise.all([server.connect(st), client.connect(ct)]);
  const { tools } = await client.listTools();
  await client.close();
  return tools.map((t) => ({ name: t.name, description: t.description ?? "" }));
}

const tools = await liveTools();

const manifest = {
  manifest_version: "0.3",
  name: "aprovodka",
  display_name: "aprovodka — 1C:Enterprise via OData",
  version: pkg.version,
  description: pkg.description,
  author: { name: "theYahia", url: "https://github.com/theYahia" },
  homepage: "https://github.com/theYahia/aprovodka",
  documentation: "https://github.com/theYahia/WWmcp/tree/main/servers/aprovodka",
  license: "MIT",
  keywords: pkg.keywords,
  server: {
    type: "node",
    entry_point: "server/dist/index.js",
    mcp_config: {
      command: "node",
      args: ["${__dirname}/server/dist/index.js"],
      env: {
        ONEC_BASE_URL: "${user_config.base_url}",
        ONEC_LOGIN: "${user_config.login}",
        ONEC_PASSWORD: "${user_config.password}",
        ONEC_SERVICES: "${user_config.services}",
        ONEC_WRITE_MODE: "${user_config.write_mode}",
      },
    },
  },
  user_config: {
    base_url: {
      type: "string",
      title: "1C base URL",
      description:
        "Адрес опубликованной информационной базы — тот же, что у веб-клиента, без суффикса /odata/… " +
        "Например http://server:8080/base",
      required: true,
    },
    login: {
      type: "string",
      title: "1C login",
      description: "Пользователь 1С для HTTP Basic. Права ограничивайте РОЛЬЮ этого пользователя.",
      required: true,
    },
    password: {
      type: "string",
      title: "1C password",
      description: "Пароль пользователя 1С.",
      sensitive: true,
      required: true,
    },
    services: {
      type: "string",
      title: "Модули (необязательно)",
      description:
        "Список модулей через запятую, чтобы не занимать контекст лишними инструментами: " +
        "catalogs, documents, registers, accounting, constants, shortcuts, reports, odata, batch, changes. " +
        "Пусто = все. Модуль meta включён всегда.",
      required: false,
      default: "",
    },
    write_mode: {
      type: "string",
      title: "Режим записи",
      description:
        "off — запись выполняется сразу (по умолчанию); preview — запись НИКОГДА не выполняется, " +
        "возвращается только предпросмотр; approval — каждая запись требует отдельного подтверждения.",
      required: false,
      default: "off",
    },
  },
  tools,
  compatibility: {
    platforms: ["darwin", "win32", "linux"],
    runtimes: { node: ">=18.0.0" },
  },
};

// --- staging -------------------------------------------------------------
const stage = mkdtempSync(join(tmpdir(), "aprovodka-mcpb-"));
const serverDir = join(stage, "server");
mkdirSync(serverDir, { recursive: true });

cpSync(join(root, "dist"), join(serverDir, "dist"), { recursive: true });
for (const f of ["README.md", "LICENSE"]) cpSync(join(root, f), join(stage, f));

// Прод-зависимости ставим в staging из npm: workspace-симлинк на packages/core
// в бандл не положишь, а внутри тарбола зависимость уже указана точной версией.
writeFileSync(
  join(serverDir, "package.json"),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      type: "module",
      dependencies: Object.fromEntries(
        Object.entries(pkg.dependencies).map(([k, v]) => [k, v === "workspace:*" ? "*" : v]),
      ),
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(join(stage, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`staging: ${stage}\ninstalling production deps…`);
execFileSync("npm", ["install", "--omit=dev", "--no-audit", "--no-fund", "--silent"], {
  cwd: serverDir,
  stdio: "inherit",
  shell: process.platform === "win32",
});

// --- pack ----------------------------------------------------------------
const outDir = join(root, "mcpb");
mkdirSync(outDir, { recursive: true });
execFileSync("npx", ["--yes", "@anthropic-ai/mcpb@2.1.2", "pack", stage, join(outDir, `aprovodka-${pkg.version}.mcpb`)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

rmSync(stage, { recursive: true, force: true });
console.log(`\n${readdirSync(outDir).join("\n")}`);
console.log(`tools in manifest: ${tools.length}`);
