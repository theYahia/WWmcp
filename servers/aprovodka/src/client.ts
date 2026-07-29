/**
 * 1C:Enterprise REST/OData client.
 *
 * Uses BaseHttpClient + BasicAuthStrategy from @theyahia/mcp-core.
 * Re-exports oneCGet/oneCPost/oneCPatch + buildODataPath as functional API
 * so tools/* can keep their signatures unchanged across the v1 → v2 migration.
 */

import { BaseHttpClient, BasicAuthStrategy, createLogger } from "@theyahia/mcp-core";
import { enrichOneCError } from "./lib/errors.js";

const logger = createLogger("aprovodka");

/** Wrap a request promise to enrich 1C errors with Russian-aware hints. */
async function withOneCErrorEnrichment<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    throw enrichOneCError(e);
  }
}

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
 * Escape a value for safe use inside an OData string literal ('…').
 * OData/1C escape a single quote by doubling it; this stops a quote in
 * user- or LLM-supplied data from breaking out of the literal ($filter injection).
 */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

/** A 1C Ref_Key is a standard UUID; used to validate keyed-path input. */
export const GUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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
  return withOneCErrorEnrichment(getClient().request({ method: "GET", path }));
}

export async function oneCPost(path: string, body: unknown): Promise<unknown> {
  return withOneCErrorEnrichment(getClient().request({ method: "POST", path, body }));
}

export async function oneCPatch(path: string, body: unknown): Promise<unknown> {
  return withOneCErrorEnrichment(getClient().request({ method: "PATCH", path, body }));
}

export async function oneCDelete(path: string): Promise<unknown> {
  return withOneCErrorEnrichment(getClient().request({ method: "DELETE", path }));
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
  // Guard: refKey is interpolated into the path inside guid'…'. Validating it as
  // a GUID makes OData injection through the key impossible, regardless of caller.
  if (!GUID_RE.test(refKey)) {
    throw new Error(
      `Invalid Ref_Key (expected a GUID like 01234567-89ab-cdef-0123-456789abcdef): ${refKey}`,
    );
  }
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
