/**
 * İletiMerkezi v1 JSON API client.
 *
 * Every operation is a POST to `<base>/<action>/json` with the credentials and
 * the operation payload nested inside a single `request` envelope:
 *
 *   { "request": { "authentication": { key, hash }, ...input } }
 *
 * There is deliberately NO client-side hashing: `hash` is the value the panel
 * precomputes, passed through unchanged. (Pre-4.0 releases signed
 * SHA256(key+secret+timestamp) into X-API-Key/X-API-Hash headers — that API
 * never existed.)
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient for retry/timeout/logging. 4xx is
 * NOT surfaced as a throw: those bodies carry meaningful API status codes, so
 * `call` returns them for the tool layer to interpret.
 */

import { ApiError, BaseHttpClient, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://api.iletimerkezi.com/v1";
const logger = createLogger("ileti-merkezi-mcp");

export interface Credentials {
  key: string;
  hash: string;
}

export class MissingCredentialsError extends Error {
  constructor() {
    super(
      "İletiMerkezi credentials missing. Set ILETIMERKEZI_API_KEY and " +
        "ILETIMERKEZI_API_HASH (aliases ILETI_API_KEY / ILETI_API_HASH are also accepted) " +
        "in your MCP client config. Both values are issued — already paired — from " +
        "panel.iletimerkezi.com → Settings → Security → API Access; copy them as-is " +
        "(the panel precomputes the hash, do NOT hash anything yourself). Also enable " +
        '"Allow API access" under Settings → Security, otherwise the API returns 401. ' +
        "See https://www.iletimerkezi.com/docs/api/authentication",
    );
    this.name = "MissingCredentialsError";
  }
}

/**
 * Read API credentials from the environment. Primary names match the official
 * provider tooling so configs are drop-in; the ILETI_* aliases ease migration
 * from the pre-4.0 layout.
 */
export function readCredentials(): Credentials {
  const key = (process.env["ILETIMERKEZI_API_KEY"] ?? process.env["ILETI_API_KEY"] ?? "").trim();
  const hash = (process.env["ILETIMERKEZI_API_HASH"] ?? process.env["ILETI_API_HASH"] ?? "").trim();
  if (!key || !hash) throw new MissingCredentialsError();
  return { key, hash };
}

export interface ApiResult {
  /** Transport-level HTTP status. */
  status: number;
  /** Parsed JSON body (or raw text when the response was not JSON). */
  body: unknown;
  /** Fully-qualified URL the request was sent to (handy in error messages). */
  requestUrl: string;
}

function parseBody(text: string | undefined): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text; // provider returned non-JSON (e.g. an HTML error page)
  }
}

/**
 * Lazy-initialized client. Construction never throws — credentials are read on
 * the first call, so the server still boots (and lists tools) unconfigured.
 */
export class IletiMerkeziClient {
  private _http: BaseHttpClient | null = null;

  private get http(): BaseHttpClient {
    if (!this._http) {
      this._http = new BaseHttpClient({
        baseUrl: BASE_URL,
        timeout: 30_000,
        maxRetries: 3,
        logger,
        headers: { Accept: "application/json" },
      });
    }
    return this._http;
  }

  /** Test/env-change helper: drop the cached HTTP client. */
  reset(): void {
    this._http = null;
  }

  /**
   * POST `input` to `<base><path>`, wrapped in the authenticated request
   * envelope. Returns 4xx/5xx responses instead of throwing — their bodies hold
   * the İletiMerkezi status code the caller needs. Only transport failures
   * (timeout, socket error) and missing credentials throw.
   */
  async call(path: string, input: Record<string, unknown> = {}): Promise<ApiResult> {
    const creds = readCredentials();
    const requestUrl = `${BASE_URL}${path}`;
    const body = { request: { authentication: creds, ...input } };

    try {
      return { status: 200, body: await this.http.request({ method: "POST", path, body }), requestUrl };
    } catch (error) {
      // status 0 == transport failure (timeout / socket), no HTTP response to report.
      if (error instanceof ApiError && error.status > 0) {
        return { status: error.status, body: parseBody(error.body), requestUrl };
      }
      throw error;
    }
  }
}
