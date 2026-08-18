/**
 * Конфигурация сервера: загрузка .env (для локальной разработки) и версия из package.json.
 *
 * В проде MCP-клиент (Claude Desktop / Claude Code) передаёт переменные через "env" в конфиге —
 * .env нужен только для `npm run dev`. dotenv@16 пишет только в stderr и не загрязняет stdout
 * (по которому идёт JSON-RPC), поэтому безопасен для stdio-сервера.
 */

import { config as loadDotenv } from "dotenv";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

loadDotenv();

/** Версия читается из package.json — единый источник истины (исправляет рассинхрон index.ts ↔ package.json). */
function readVersion(): string {
  try {
    // dist/config.js → ../package.json ; src/config.ts → ../package.json (оба указывают на корень пакета)
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const VERSION = readVersion();

/**
 * Fail-fast проверка наличия токена при старте — понятная ошибка вместо опакового 401
 * на первом же запросе. Refresh-креды опциональны (нужны только для авто-обновления токена).
 */
export function assertCredentials(): void {
  if (!process.env.VK_ADS_TOKEN) {
    throw new Error(
      "VK_ADS_TOKEN не задан. Укажите Bearer-токен VK Ads API в переменной окружения " +
        "(env в конфиге MCP-клиента или .env для локального запуска).",
    );
  }
}

/** Доступны ли refresh-креды для авто-обновления истёкшего access_token. */
export function hasRefreshCredentials(): boolean {
  return Boolean(
    process.env.VK_ADS_CLIENT_ID &&
      process.env.VK_ADS_CLIENT_SECRET &&
      process.env.VK_ADS_REFRESH_TOKEN,
  );
}
