/**
 * 1C:Enterprise REST/OData client.
 *
 * Uses BaseHttpClient + BasicAuthStrategy from @theyahia/mcp-core.
 * Re-exports oneCGet/oneCPost/oneCPatch + buildODataPath as functional API
 * so tools/* can keep their signatures unchanged across the v1 → v2 migration.
 */

import { BaseHttpClient, BasicAuthStrategy, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("1c-rest-mcp");

function getBaseUrl(): string {
  const url = process.env["ONEC_BASE_URL"] ?? process.env["1C_BASE_URL"];
  if (!url) {
    throw new Error(
      "ONEC_BASE_URL is required (e.g. http://server:8080/base). Backward-compat alias: 1C_BASE_URL.",
    );
  }
  return url.replace(/\/+$/, "");
}

function getCredentials(): { login: string; password: string } {
  const login = process.env["ONEC_LOGIN"] ?? process.env["1C_LOGIN"];
  const password = process.env["ONEC_PASSWORD"] ?? process.env["1C_PASSWORD"];
  if (!login || !password) {
    throw new Error(
      "ONEC_LOGIN and ONEC_PASSWORD are required for HTTP Basic auth. Backward-compat aliases: 1C_LOGIN, 1C_PASSWORD.",
    );
  }
  return { login, password };
}

function createOneCClient(): BaseHttpClient {
  const { login, password } = getCredentials();
  return new BaseHttpClient({
    baseUrl: getBaseUrl(),
    timeout: 15_000,
    maxRetries: 3,
    auth: new BasicAuthStrategy(login, password),
    logger,
    headers: { Accept: "application/json" },
  });
}

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) _client = createOneCClient();
  return _client;
}

/** Reset cached client (used by tests). */
export function resetClient(): void {
  _client = null;
}

/**
 * Build OData path with optional query parameters.
 * Preserves $-prefixed keys (OData system options) without URL-encoding the $.
 */
export function buildODataPath(
  entity: string,
  query?: Record<string, string>,
): string {
  if (!query || Object.keys(query).length === 0) {
    return `/odata/standard.odata/${encodeURIComponent(entity)}`;
  }
  const qs = Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `/odata/standard.odata/${encodeURIComponent(entity)}?${qs}`;
}

export async function oneCGet(path: string): Promise<unknown> {
  return getClient().request({ method: "GET", path });
}

export async function oneCPost(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "POST", path, body });
}

export async function oneCPatch(path: string, body: unknown): Promise<unknown> {
  return getClient().request({ method: "PATCH", path, body });
}

export async function oneCDelete(path: string): Promise<unknown> {
  return getClient().request({ method: "DELETE", path });
}

/**
 * Build a keyed OData path: `Entity(guid'GUID')[/Action][?query]`.
 *
 * The entity name is URL-encoded (Cyrillic-safe), but the key tuple `(guid'…')`
 * and bound action segment (`/Post`, `/Unpost`) are structural and left intact —
 * `buildODataPath` can't be reused here because it would percent-encode the `/`
 * of the action. Matches 1C:Enterprise OData 3.0 addressing.
 */
export function buildKeyedPath(
  entity: string,
  refKey: string,
  action?: string,
  query?: Record<string, string>,
): string {
  const keyed = `${encodeURIComponent(entity)}(guid'${refKey}')`;
  const tail = action ? `/${action}` : "";
  const qs =
    query && Object.keys(query).length > 0
      ? "?" +
        Object.entries(query)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&")
      : "";
  return `/odata/standard.odata/${keyed}${tail}${qs}`;
}
