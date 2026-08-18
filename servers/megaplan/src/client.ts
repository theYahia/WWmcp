const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

// Show full upstream response bodies in logs/errors only when explicitly enabled.
// Deliberately scoped to MEGAPLAN_DEBUG so a generic DEBUG=* doesn't log bodies.
const DEBUG = Boolean(process.env.MEGAPLAN_DEBUG);

let cachedToken: string | null = null;
// Single in-flight auth, shared by concurrent callers (avoids a thundering herd
// of password grants on cold start / after a 401 invalidation).
let authPromise: Promise<string> | null = null;

/** Test helper: reset cached auth state between cases. */
export function __resetAuth(): void {
  cachedToken = null;
  authPromise = null;
}

function isStaticToken(): boolean {
  return Boolean(process.env.MEGAPLAN_TOKEN);
}

function getDomain(): string {
  const raw = process.env.MEGAPLAN_DOMAIN;
  if (!raw) throw new Error("MEGAPLAN_DOMAIN is not set");
  let domain = raw.replace(/^https?:\/\//i, "").replace(/\/+$/, "").trim();
  // Config-time SSRF guard: a bare host[:port] only — no path, credentials, or spaces.
  if (!/^[a-zA-Z0-9.\-]+(:[0-9]+)?$/.test(domain)) {
    throw new Error(
      `MEGAPLAN_DOMAIN is invalid: "${raw}". Provide a bare host like "yourcompany" or "yourcompany.megaplan.ru".`,
    );
  }
  // A bare subdomain ("yourcompany") is expanded to "yourcompany.megaplan.ru".
  if (!domain.includes(".")) domain = `${domain}.megaplan.ru`;
  return domain;
}

function getBaseUrl(): string {
  return `https://${getDomain()}/api/v3`;
}

async function authenticate(): Promise<string> {
  const login = process.env.MEGAPLAN_LOGIN;
  const password = process.env.MEGAPLAN_PASSWORD;
  if (!login || !password) {
    throw new Error("Either MEGAPLAN_TOKEN or (MEGAPLAN_LOGIN + MEGAPLAN_PASSWORD) must be set");
  }

  // The v3 access_token endpoint expects form fields, not a JSON body. We send
  // application/x-www-form-urlencoded (the OAuth2 password-grant standard).
  // TODO(live-verify): if an account rejects urlencoded, switch to multipart
  // FormData (the form the official curl example shows) or JSON.
  const body = new URLSearchParams({
    username: login,
    password,
    grant_type: "password",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);
  let response: Response;
  try {
    response = await fetch(`https://${getDomain()}/api/v3/auth/access_token`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("Megaplan auth timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const text = await safeText(response);
    throw new Error(`Megaplan auth failed (${response.status})${errorDetail(text)}`);
  }

  const data = (await response.json()) as {
    access_token?: string;
    data?: { access_token?: string };
  };
  const token = data.access_token ?? data.data?.access_token;
  if (!token) throw new Error("Megaplan auth: no access_token in response");
  return token;
}

async function getToken(): Promise<string> {
  const envToken = process.env.MEGAPLAN_TOKEN;
  if (envToken) return envToken;
  if (cachedToken) return cachedToken;
  if (authPromise) return authPromise;

  authPromise = authenticate()
    .then((token) => {
      cachedToken = token;
      return token;
    })
    .finally(() => {
      authPromise = null;
    });
  return authPromise;
}

export async function megaplanGet(path: string, params?: Record<string, unknown>): Promise<unknown> {
  // v3 collection endpoints take a single JSON object (limit, filter, pageAfter,
  // …) URL-encoded into the query string — not flat query params.
  // TODO(live-verify): some accounts accept the raw `?{json}` form; percent-
  // encoding is the safe default.
  let query = "";
  if (params && Object.keys(params).length > 0) {
    query = `?${encodeURIComponent(JSON.stringify(params))}`;
  }
  return megaplanRequest("GET", `${path}${query}`);
}

export async function megaplanPost(path: string, body: unknown): Promise<unknown> {
  return megaplanRequest("POST", path, body);
}

async function megaplanRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const token = await getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    let response: Response;
    try {
      response = await fetch(`${getBaseUrl()}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timer);
      if (isRetriableNetworkError(error) && attempt < MAX_RETRIES) {
        if (DEBUG) console.error(`[megaplan-mcp] network error, retry (${attempt}/${MAX_RETRIES})`);
        await sleep(backoff(attempt));
        continue;
      }
      throw normalizeNetworkError(error);
    }
    clearTimeout(timer);

    if (response.status === 401) {
      if (isStaticToken()) {
        throw new Error("Megaplan HTTP 401: access token rejected (check MEGAPLAN_TOKEN).");
      }
      // login/password mode: invalidate only the token we actually used, then retry.
      // We deliberately do NOT null authPromise here: leaving it intact lets
      // concurrent 401s (e.g. a token expiring under load) share getToken's single
      // in-flight re-auth instead of each kicking off its own auth request. The
      // `=== token` guard avoids wiping a fresh token a peer already obtained.
      if (cachedToken === token) {
        cachedToken = null;
      }
      if (attempt < MAX_RETRIES) {
        if (DEBUG) console.error(`[megaplan-mcp] 401, re-authenticating (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      const text = await safeText(response);
      throw new Error(`Megaplan HTTP 401${errorDetail(text)}`);
    }

    if (response.ok) return parseBody(response);

    if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
      const delay = retryAfterDelay(response, attempt);
      if (DEBUG) {
        console.error(`[megaplan-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
      }
      await sleep(delay);
      continue;
    }

    const text = await safeText(response);
    throw new Error(`Megaplan HTTP ${response.status}${errorDetail(text)}`);
  }
  throw new Error("Megaplan: all retries exhausted");
}

// ── helpers ──

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function backoff(attempt: number): number {
  return Math.min(1000 * 2 ** (attempt - 1), 8000);
}

function retryAfterDelay(response: Response, attempt: number): number {
  const header = response.headers.get("retry-after");
  if (header) {
    const seconds = Number(header);
    if (Number.isFinite(seconds)) return clampDelay(seconds * 1000);
    const date = Date.parse(header);
    if (!Number.isNaN(date)) return clampDelay(date - Date.now());
  }
  return backoff(attempt);
}

function clampDelay(ms: number): number {
  return Math.min(Math.max(ms, 0), 60_000);
}

function isRetriableNetworkError(error: unknown): boolean {
  // AbortError = our timeout fired; TypeError = undici "fetch failed"
  // (ECONNRESET/ENOTFOUND/ECONNREFUSED/TLS hiccups).
  if (error instanceof DOMException && error.name === "AbortError") return true;
  if (error instanceof TypeError) return true;
  return false;
}

function normalizeNetworkError(error: unknown): Error {
  if (error instanceof DOMException && error.name === "AbortError") {
    return new Error("Megaplan request timed out");
  }
  if (error instanceof Error) return error;
  return new Error(String(error));
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Megaplan: expected JSON but got a non-JSON response (${response.status})${errorDetail(text)}`,
    );
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

/** A short, sanitized snippet of an upstream error body for the thrown message. */
function errorDetail(text: string): string {
  if (!text) return "";
  if (DEBUG) return `: ${text}`;
  const snippet = text.replace(/\s+/g, " ").trim().slice(0, 200);
  return snippet ? `: ${snippet}` : "";
}
