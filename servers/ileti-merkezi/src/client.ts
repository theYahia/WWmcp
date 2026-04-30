/**
 * Ileti Merkezi SMS API client.
 *
 * Custom HMAC-style auth: SHA256(apiKey + secret + ISO_timestamp), sent as
 * X-API-Key + X-API-Hash headers. The timestamp is recomputed on every
 * request — Ileti Merkezi's server uses a tolerance window for replay protection.
 *
 * Wraps @theyahia/mcp-core's BaseHttpClient via a custom AuthStrategy.
 */

import * as crypto from "node:crypto";
import {
  BaseHttpClient,
  createLogger,
  type AuthStrategy,
} from "@theyahia/mcp-core";

const BASE_URL = "https://api.iletimerkezi.com/v1";
const logger = createLogger("ileti-merkezi-mcp");

/**
 * Per-request HMAC: SHA256(apiKey + secret + timestamp), sent in X-API-Hash.
 */
class IletiHmacStrategy implements AuthStrategy {
  readonly type = "ileti_hmac";

  constructor(
    private readonly apiKey: string,
    private readonly secret: string,
  ) {}

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const timestamp = new Date().toISOString();
    const hash = crypto
      .createHash("sha256")
      .update(this.apiKey + this.secret + timestamp, "utf8")
      .digest("hex");

    const headers = new Headers(req.headers);
    headers.set("X-API-Key", this.apiKey);
    headers.set("X-API-Hash", hash);
    return { ...req, headers };
  }
}

function buildClient(): BaseHttpClient {
  const apiKey = process.env["ILETI_API_KEY"];
  const secret = process.env["ILETI_SECRET"];
  if (!apiKey || !secret) {
    throw new Error(
      "ILETI_API_KEY and ILETI_SECRET are required. Get them at https://www.iletimerkezi.com/ (panel → API).",
    );
  }
  return new BaseHttpClient({
    baseUrl: BASE_URL,
    timeout: 15_000,
    maxRetries: 3,
    auth: new IletiHmacStrategy(apiKey, secret),
    logger,
    headers: { Accept: "application/json" },
  });
}

/**
 * Lazy-initialized client wrapper. Public shape matches the v1 IletiMerkeziClient
 * so existing tool code (and tests) don't need rewrites.
 */
export class IletiMerkeziClient {
  private _http: BaseHttpClient | null = null;

  private get http(): BaseHttpClient {
    if (!this._http) this._http = buildClient();
    return this._http;
  }

  reset(): void {
    this._http = null;
  }

  async request(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<unknown> {
    return this.http.request({ method, path, body });
  }
}
