import { VERSION } from "./version.js";

const BASE_URL = "https://api.iletimerkezi.com/v1";
const TIMEOUT_MS = 30_000;

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
 * from this package's pre-2.0 layout.
 */
export function readCredentials(env: NodeJS.ProcessEnv = process.env): Credentials {
  const key = (env.ILETIMERKEZI_API_KEY ?? env.ILETI_API_KEY ?? "").trim();
  const hash = (env.ILETIMERKEZI_API_HASH ?? env.ILETI_API_HASH ?? "").trim();
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

export interface ClientOptions {
  baseUrl?: string;
  timeoutMs?: number;
  /** Injectable fetch — used by tests; defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * Thin transport over the İletiMerkezi v1 JSON API.
 *
 * Every operation is a POST to `<base>/<action>/json` with the credentials and
 * the operation payload nested inside a single `request` envelope:
 *
 *   { "request": { "authentication": { key, hash }, ...input } }
 *
 * There is deliberately no client-side hashing: the `hash` is the value the
 * panel precomputes and the client passes through unchanged.
 */
export class IletiMerkeziClient {
  private readonly creds: Credentials;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(creds: Credentials, opts: ClientOptions = {}) {
    this.creds = creds;
    this.baseUrl = (opts.baseUrl ?? BASE_URL).replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? TIMEOUT_MS;
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  /**
   * POST `input` to `<base>/<path>`, wrapped in the authenticated request
   * envelope. 4xx responses are NOT thrown — they carry meaningful API status
   * codes in the body, so they are returned for the caller to interpret. Only
   * network failures and timeouts throw.
   */
  async call(path: string, input: Record<string, unknown> = {}): Promise<ApiResult> {
    const requestUrl = `${this.baseUrl}${path}`;
    const payload = {
      request: {
        authentication: { key: this.creds.key, hash: this.creds.hash },
        ...input,
      },
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": `ileti-merkezi-mcp/${VERSION}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const text = await response.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text; // provider returned non-JSON (e.g. an HTML error page)
      }
      return { status: response.status, body, requestUrl };
    } catch (error) {
      if ((error as { name?: string })?.name === "AbortError") {
        throw new Error(
          `İletiMerkezi: request to ${path} timed out after ${this.timeoutMs / 1000}s.`,
        );
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }
}
