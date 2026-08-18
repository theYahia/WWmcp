import { PKG_NAME, VERSION } from "./version.js";
import type { ParasutSingleResult } from "./types.js";

const AUTH_URL = "https://api.parasut.com/oauth/token";
const API_ROOT = "https://api.parasut.com/v4";
const REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob";

const TIMEOUT = 15_000;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 30_000;

const USER_AGENT = `${PKG_NAME}/${VERSION}`;

function envInt(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

// --- Rate limiting -----------------------------------------------------------
//
// Parasut documents "10 requests per 10 seconds" (no per-IP/per-token detail,
// no documented 429 status or Retry-After header). We model it as a fixed
// 10-second window bucket and pace requests client-side so we never trip the
// throttle in the first place. Tunable via PARASUT_RATE_BUCKET.

const REFILL_MS = 10_000;
const BUCKET_MAX = envInt("PARASUT_RATE_BUCKET", 10);
const MAX_CONCURRENT = envInt("PARASUT_MAX_CONCURRENT", 5);

let tokens = BUCKET_MAX;
let windowStart = Date.now();

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Acquire one unit from the fixed-window bucket, waiting for the next window if
 * empty. Check-and-decrement runs synchronously, so concurrent callers can't
 * double-spend.
 */
async function acquireToken(): Promise<void> {
  for (;;) {
    const now = Date.now();
    if (now - windowStart >= REFILL_MS) {
      tokens = BUCKET_MAX;
      windowStart = now;
    }
    if (tokens > 0) {
      tokens -= 1;
      return;
    }
    const wait = REFILL_MS - (now - windowStart);
    await sleep(wait > 0 ? wait : REFILL_MS);
  }
}

// --- Concurrency cap ---------------------------------------------------------

let active = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
}

function releaseSlot(): void {
  const next = waiters.shift();
  if (next) next();
  else active--;
}

// --- Auth state --------------------------------------------------------------

let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry = 0;
let resolvedCompanyId: string | null = null;

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

function assertAuthConfigured(): void {
  const missing = ["PARASUT_CLIENT_ID", "PARASUT_CLIENT_SECRET", "PARASUT_USERNAME", "PARASUT_PASSWORD"].filter(
    (n) => !env(n),
  );
  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Parasut API v4 uses the OAuth 'password' grant (client_credentials is NOT supported): set " +
        "PARASUT_CLIENT_ID, PARASUT_CLIENT_SECRET, PARASUT_USERNAME (account email) and PARASUT_PASSWORD. " +
        "Optionally set PARASUT_COMPANY_ID (otherwise it is resolved via GET /me). " +
        "Register an API app and get credentials at https://apidocs.parasut.com/.",
    );
  }
}

/** POST the token endpoint with a form body and store the resulting tokens. */
async function fetchToken(form: Record<string, string>): Promise<void> {
  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": USER_AGENT },
    body: new URLSearchParams(form),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Parasut OAuth error ${response.status}: ${text}`);
  }

  const data = (await response.json()) as TokenResponse;
  accessToken = data.access_token;
  // Each refresh ROTATES the refresh_token — always overwrite with the newest.
  if (data.refresh_token) refreshToken = data.refresh_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
}

async function passwordGrant(): Promise<void> {
  assertAuthConfigured();
  await fetchToken({
    grant_type: "password",
    client_id: env("PARASUT_CLIENT_ID")!,
    client_secret: env("PARASUT_CLIENT_SECRET")!,
    username: env("PARASUT_USERNAME")!,
    password: env("PARASUT_PASSWORD")!,
    redirect_uri: REDIRECT_URI,
  });
}

async function refreshGrant(): Promise<void> {
  await fetchToken({
    grant_type: "refresh_token",
    client_id: env("PARASUT_CLIENT_ID")!,
    client_secret: env("PARASUT_CLIENT_SECRET")!,
    refresh_token: refreshToken!,
  });
}

/**
 * Return a valid access token, authenticating or refreshing as needed.
 *
 * Tokens live 2h (expires_in 7200). When the cached token is stale we prefer
 * grant_type=refresh_token (which rotates the refresh_token), falling back to a
 * full password grant if refresh fails. State is in-memory only: on a fresh
 * process we always password-auth, which sidesteps refresh-token rotation
 * persistence for a stateless npx-run server.
 */
async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  if (refreshToken) {
    try {
      await refreshGrant();
      return accessToken!;
    } catch {
      // Refresh token rotated/expired/revoked — drop it and re-auth fully.
      refreshToken = null;
    }
  }

  await passwordGrant();
  return accessToken!;
}

// --- Error formatting --------------------------------------------------------

/** Parse a Parasut JSON:API error body (`{ errors: [{ title, detail }] }`). */
export function formatApiError(status: number, text: string): string {
  try {
    const parsed = JSON.parse(text) as { errors?: Array<{ title?: unknown; detail?: unknown }> };
    const errs = parsed?.errors;
    if (Array.isArray(errs) && errs.length > 0) {
      const msg = errs
        .map((e) => {
          const title = e.title ? String(e.title) : "";
          const detail = e.detail ? String(e.detail) : "";
          if (title && detail) return `${title}: ${detail}`;
          return title || detail;
        })
        .filter(Boolean)
        .join("; ");
      if (msg) return `Parasut HTTP ${status}: ${msg}`;
    }
  } catch {
    // body wasn't Parasut JSON — fall through to raw text
  }
  return `Parasut HTTP ${status}: ${text}`;
}

/** Retry delay, preferring a Retry-After header (best-effort: undocumented). */
function retryDelayMs(headers: Headers, attempt: number, status: number): number {
  const retryAfter = parseInt(headers.get("Retry-After") ?? "", 10); // seconds
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, MAX_BACKOFF_MS);

  // 429 is ASSUMED (not documented). With no Retry-After, wait a full rate
  // window since that's the throttle granularity Parasut documents.
  if (status === 429) return Math.min(REFILL_MS, MAX_BACKOFF_MS);

  return Math.min(1000 * 2 ** (attempt - 1), 8000);
}

// --- HTTP core ---------------------------------------------------------------

/** Low-level authenticated fetch with rate-limit, concurrency cap and retries. */
async function apiFetch(method: string, url: string, body?: unknown): Promise<unknown> {
  await acquireSlot();
  let reauthed = false;
  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      await acquireToken();
      const token = await getAccessToken();

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": USER_AGENT,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.ok) {
          const text = await response.text();
          return text ? JSON.parse(text) : { success: true };
        }

        // Token may have been revoked before its declared expiry — re-auth once.
        if (response.status === 401 && !reauthed) {
          reauthed = true;
          accessToken = null;
          tokenExpiry = 0;
          continue;
        }

        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          const delay = retryDelayMs(response.headers, attempt, response.status);
          console.error(`[parasut-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }

        const text = await response.text();
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Parasut auth error ${response.status}: check PARASUT_CLIENT_ID/SECRET/USERNAME/PASSWORD and that ` +
              `the user has access to this company. ${formatApiError(response.status, text)}`,
          );
        }
        throw new Error(formatApiError(response.status, text));
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError") {
          if (attempt < MAX_RETRIES) {
            console.error(`[parasut-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
            continue;
          }
          throw new Error("Parasut: request timeout (15s). Try again later.");
        }
        throw error;
      }
    }
    throw new Error("Parasut: all retries exhausted");
  } finally {
    releaseSlot();
  }
}

// --- Company resolution ------------------------------------------------------

function extractCompanyId(me: ParasutSingleResult): string | undefined {
  const rels = me?.data?.relationships as
    | { company?: { data?: { id?: unknown } }; companies?: { data?: Array<{ id?: unknown }> } }
    | undefined;
  const single = rels?.company?.data?.id;
  if (typeof single === "string") return single;
  const first = rels?.companies?.data?.[0]?.id;
  if (typeof first === "string") return first;
  const included = me?.included?.find((r) => r.type === "companies");
  if (included && typeof included.id === "string") return included.id;
  return undefined;
}

/** Resolve the company id, from PARASUT_COMPANY_ID or (fallback) GET /me. */
export async function getCompanyId(): Promise<string> {
  if (resolvedCompanyId) return resolvedCompanyId;

  const configured = env("PARASUT_COMPANY_ID");
  if (configured) {
    resolvedCompanyId = configured;
    return configured;
  }

  const me = (await apiFetch("GET", `${API_ROOT}/me`)) as ParasutSingleResult;
  const id = extractCompanyId(me);
  if (!id) {
    throw new Error(
      "Could not resolve company_id from GET /me. Set PARASUT_COMPANY_ID explicitly " +
        "(it is the number in your Parasut dashboard URL, e.g. app.parasut.com/<company_id>/...).",
    );
  }
  resolvedCompanyId = id;
  return id;
}

// --- Public request helpers --------------------------------------------------

/** Company-scoped request: `${API_ROOT}/${company_id}${path}`. */
export async function parasutRequest(method: string, path: string, body?: unknown): Promise<unknown> {
  const companyId = await getCompanyId();
  return apiFetch(method, `${API_ROOT}/${companyId}${path}`, body);
}

export const parasutGet = (path: string): Promise<unknown> => parasutRequest("GET", path);
export const parasutPost = (path: string, body?: unknown): Promise<unknown> => parasutRequest("POST", path, body);
export const parasutPut = (path: string, body?: unknown): Promise<unknown> => parasutRequest("PUT", path, body);
export const parasutPatch = (path: string, body?: unknown): Promise<unknown> => parasutRequest("PATCH", path, body);
export const parasutDelete = (path: string): Promise<unknown> => parasutRequest("DELETE", path);

/** GET /me — current user + accessible companies (not company-scoped). */
export async function parasutMe(): Promise<unknown> {
  return apiFetch("GET", `${API_ROOT}/me`);
}

// --- Test-only internals -----------------------------------------------------

/** Reset all in-memory auth/company/rate state (for unit tests). */
export function _reset(): void {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = 0;
  resolvedCompanyId = null;
  tokens = BUCKET_MAX;
  windowStart = Date.now();
  active = 0;
  waiters.length = 0;
}

export {
  formatApiError as _formatApiError,
  retryDelayMs as _retryDelayMs,
  extractCompanyId as _extractCompanyId,
  getAccessToken as _getAccessToken,
  API_ROOT as _API_ROOT,
  AUTH_URL as _AUTH_URL,
};
