/**
 * Structured logging for MCP servers.
 *
 * CRITICAL: When using stdio transport, stdout is reserved for JSON-RPC.
 * ALL logs MUST go to stderr. console.log() will break the MCP protocol.
 *
 * This module provides a lightweight structured logger that writes to stderr
 * with JSON format for easy parsing by log aggregators.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface Logger {
  debug(msg: string, data?: Record<string, unknown>): void;
  info(msg: string, data?: Record<string, unknown>): void;
  warn(msg: string, data?: Record<string, unknown>): void;
  error(msg: string, data?: Record<string, unknown>): void;
}

const SENSITIVE_KEYS = new Set([
  "token",
  "password",
  "secret",
  "api_key",
  "apikey",
  "authorization",
  "client_secret",
  "access_token",
  "refresh_token",
  "private_key",
]);

/**
 * Recursively mask sensitive fields in log data.
 *
 * Arrays are descended into as well: skipping them (as this did) meant a single
 * `[{ access_token: "..." }]` in a log payload wrote the token to stderr verbatim,
 * which is exactly the case the mask exists to prevent.
 */
function maskValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskValue);
  if (typeof value === "object" && value !== null) {
    return maskSensitive(value as Record<string, unknown>);
  }
  return value;
}

function maskSensitive(
  obj: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? "***" : maskValue(value);
  }
  return result;
}

/**
 * Creates a structured logger for an MCP server.
 * All output goes to stderr to avoid breaking stdio JSON-RPC.
 */
export function createLogger(serverName: string): Logger {
  const minLevel =
    (process.env.LOG_LEVEL as LogLevel | undefined) || "info";
  const minOrder = LEVEL_ORDER[minLevel] ?? LEVEL_ORDER.info;

  function log(
    level: LogLevel,
    msg: string,
    data?: Record<string, unknown>,
  ): void {
    if (LEVEL_ORDER[level] < minOrder) return;

    const entry: Record<string, unknown> = {
      ts: new Date().toISOString(),
      level,
      server: serverName,
      msg,
    };

    if (data) {
      Object.assign(entry, maskSensitive(data));
    }

    // Always stderr — stdout is reserved for MCP JSON-RPC
    process.stderr.write(JSON.stringify(entry) + "\n");
  }

  return {
    debug: (msg, data) => log("debug", msg, data),
    info: (msg, data) => log("info", msg, data),
    warn: (msg, data) => log("warn", msg, data),
    error: (msg, data) => log("error", msg, data),
  };
}
