/**
 * Authentication strategies for MCP servers.
 *
 * Strategy Pattern: each auth type implements AuthStrategy interface.
 * Covers all 5 auth methods used across the 53 servers:
 * - API Key (Bearer token)
 * - Basic Auth (username:password)
 * - OAuth2 Client Credentials
 * - HMAC/Signature-based
 * - No Auth (pass-through)
 */

export interface AuthStrategy {
  readonly type: string;
  authenticate(request: RequestInit): Promise<RequestInit>;
  /** Called when server returns 401 — clear cached credentials */
  invalidate?(): void;
}

/** Bearer token or custom header API key auth */
export class ApiKeyStrategy implements AuthStrategy {
  readonly type = "api_key";

  constructor(
    private readonly key: string,
    private readonly header = "Authorization",
    private readonly prefix = "Bearer",
  ) {}

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const headers = new Headers(req.headers);
    headers.set(this.header, `${this.prefix} ${this.key}`);
    return { ...req, headers };
  }
}

/** HTTP Basic Authentication (base64 encoded) */
export class BasicAuthStrategy implements AuthStrategy {
  readonly type = "basic";
  private readonly encoded: string;

  constructor(username: string, password: string) {
    this.encoded = Buffer.from(`${username}:${password}`).toString("base64");
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Basic ${this.encoded}`);
    return { ...req, headers };
  }
}

/** OAuth2 Client Credentials flow with auto-refresh and concurrent request dedup */
export class OAuthStrategy implements AuthStrategy {
  readonly type = "oauth";
  private token: string | null = null;
  private expiresAt = 0;
  private refreshPromise: Promise<string> | null = null;

  constructor(
    private readonly config: {
      tokenUrl: string;
      clientId: string;
      clientSecret: string;
      /** Safety margin in ms before token expiry (default: 60s) */
      expiryBuffer?: number;
      /** Token-endpoint request timeout in ms (default: 15s) */
      timeout?: number;
    },
  ) {}

  invalidate(): void {
    this.token = null;
    this.expiresAt = 0;
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    const token = await this.getToken();
    const headers = new Headers(req.headers);
    headers.set("Authorization", `Bearer ${token}`);
    return { ...req, headers };
  }

  private async getToken(): Promise<string> {
    const buffer = this.config.expiryBuffer ?? 60_000;
    if (this.token && Date.now() < this.expiresAt - buffer) {
      return this.token;
    }
    // Deduplicate concurrent refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.refresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async refresh(): Promise<string> {
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    // Timeout is NOT optional here: this fetch sits in front of every authenticated
    // request on every OAuth server, and it is the one call that does not go through
    // BaseHttpClient's AbortController. Without it a hung token endpoint hangs the
    // tool call forever — the model gets no error and no result, just silence.
    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(this.config.timeout ?? 15_000),
    });

    if (!response.ok) {
      // The body is NOT echoed: an OAuth error response routinely reflects the
      // submitted credentials back (some providers include client_id, and a
      // misconfigured tokenUrl can be any host at all), and this message travels
      // into the model's context via createToolError.
      throw new Error(
        `OAuth token error (HTTP ${response.status}). Проверьте client_id, client_secret и tokenUrl.`,
      );
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };
    this.token = data.access_token;
    this.expiresAt = Date.now() + data.expires_in * 1000;
    return this.token;
  }
}

/** Dual auth: tries Bearer token first, falls back to Basic */
export class DualAuthStrategy implements AuthStrategy {
  readonly type = "dual";
  private readonly strategy: AuthStrategy;

  constructor(config: {
    token?: string;
    login?: string;
    password?: string;
  }) {
    if (config.token) {
      this.strategy = new ApiKeyStrategy(config.token);
    } else if (config.login && config.password) {
      this.strategy = new BasicAuthStrategy(config.login, config.password);
    } else {
      throw new Error(
        "Auth not configured. Provide token OR login+password.",
      );
    }
  }

  async authenticate(req: RequestInit): Promise<RequestInit> {
    return this.strategy.authenticate(req);
  }
}

/** No-auth pass-through for public APIs (CBR, CBU) */
export class NoAuthStrategy implements AuthStrategy {
  readonly type = "none";

  async authenticate(req: RequestInit): Promise<RequestInit> {
    return req;
  }
}
