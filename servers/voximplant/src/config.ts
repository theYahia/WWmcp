import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createLogger } from "@theyahia/mcp-core";

export const logger = createLogger("voximplant-mcp");

/** Версия пакета — single source of truth (package.json). */
function readVersion(): string {
  try {
    // src/config.ts (dev) и dist/config.js (prod) оба лежат на один уровень ниже package.json.
    const here = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(join(here, "..", "package.json"), "utf8")) as { version?: string };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export const VERSION = readVersion();

export interface Credentials {
  accountId: string;
  apiKey: string;
}

export function getCredentials(): Credentials | null {
  const accountId = process.env.VOXIMPLANT_ACCOUNT_ID;
  const apiKey = process.env.VOXIMPLANT_API_KEY;
  if (!accountId || !apiKey) return null;
  return { accountId, apiKey };
}

/** Fail-fast при старте: понятная ошибка вместо непрозрачного 401 при первом вызове. */
export function assertCredentials(): void {
  if (!getCredentials()) {
    throw new Error(
      "VOXIMPLANT_ACCOUNT_ID и VOXIMPLANT_API_KEY не заданы. " +
        "Получите их в панели управления (manage.voximplant.com) и передайте через env MCP-клиента.",
    );
  }
}

/**
 * Минимальный загрузчик `.env` для локальной разработки (без зависимости dotenv).
 * Не перезаписывает уже заданные переменные. В проде env приходит от MCP-хоста.
 */
export function loadDotenv(path = ".env"): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}
