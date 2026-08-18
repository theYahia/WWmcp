import { PKG_NAME, VERSION } from "./version.js";

const TIMEOUT = 15_000;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 30_000;

const USER_AGENT = `${PKG_NAME}/${VERSION}`;

function envInt(name: string, fallback: number): number {
  const v = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

// Client-side politeness cap. Kaiten's exact rate-limit tier isn't publicly
// documented, so we keep concurrency modest and lean on 429 + Retry-After for
// backpressure. Raise via KAITEN_MAX_CONCURRENT if your plan allows more.
const MAX_CONCURRENT = envInt("KAITEN_MAX_CONCURRENT", 5);

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// --- Base URL resolution ------------------------------------------------------
//
// Priority:
//   1. KAITEN_BASE_URL  — full API base, e.g. "https://kaiten.mycorp.ru/api/latest"
//                         (self-hosted / enterprise / on-premise).
//   2. KAITEN_DOMAIN with a dot — treated as a full host: "acme.kaiten.io" ->
//                         "https://acme.kaiten.io/api/latest" (covers .ru AND .io).
//   3. KAITEN_DOMAIN bare subdomain — "acme" -> "https://acme.kaiten.ru/api/latest".

function resolveBaseUrl(): string {
  const explicit = process.env.KAITEN_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const domain = process.env.KAITEN_DOMAIN;
  if (!domain) {
    throw new Error("KAITEN_DOMAIN is not set (or set KAITEN_BASE_URL for self-hosted Kaiten).");
  }
  const host = domain.includes(".") ? domain : `${domain}.kaiten.ru`;
  return `https://${host}/api/latest`;
}

function getAuthHeader(): string {
  const token = process.env.KAITEN_TOKEN;
  if (!token) throw new Error("KAITEN_TOKEN is not set.");
  return `Bearer ${token}`;
}

// --- Concurrency cap ----------------------------------------------------------

let active = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  // Wait to be handed the slot by releaseSlot (which keeps `active` unchanged).
  await new Promise<void>((resolve) => waiters.push(resolve));
}

function releaseSlot(): void {
  const next = waiters.shift();
  if (next) next();
  else active--;
}

// --- Error formatting ---------------------------------------------------------

/**
 * Turn a Kaiten error response body into a readable one-line message. Kaiten
 * error payloads vary by endpoint; we defensively pull the common fields
 * (`message`, `error`, `errors`) and fall back to the raw text otherwise.
 */
function formatApiError(status: number, text: string): string {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const parts: string[] = [];
    if (typeof parsed.message === "string") parts.push(parsed.message);
    if (typeof parsed.error === "string" && parsed.error !== parsed.message) parts.push(parsed.error);
    if (parsed.errors !== undefined) parts.push(JSON.stringify(parsed.errors));
    if (parts.length) return `Kaiten HTTP ${status}: ${parts.join(" — ")}`;
  } catch {
    // body wasn't JSON — fall through to the raw text
  }
  const trimmed = text.trim();
  return trimmed ? `Kaiten HTTP ${status}: ${trimmed}` : `Kaiten HTTP ${status}`;
}

/** Compute the retry delay, preferring Kaiten's `Retry-After` header. */
function retryDelayMs(headers: Headers, attempt: number): number {
  const retryAfter = parseInt(headers.get("Retry-After") ?? "", 10); // seconds
  if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.min(retryAfter * 1000, MAX_BACKOFF_MS);
  return Math.min(1000 * 2 ** (attempt - 1), 8000);
}

// --- HTTP ---------------------------------------------------------------------

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Core request. `path` must start with `/` and already include any query string
 * (build it with `buildQuery` in lib.ts). Returns parsed JSON, or
 * `{ success: true }` for empty bodies (e.g. 204 from DELETE).
 */
export async function kaitenRequest(method: Method, path: string, body?: unknown): Promise<unknown> {
  const baseUrl = resolveBaseUrl();
  const authHeader = getAuthHeader();

  await acquireSlot();
  try {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);

      try {
        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: authHeader,
            "User-Agent": USER_AGENT,
          },
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.ok) {
          const text = await response.text();
          return text ? JSON.parse(text) : { success: true };
        }

        if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
          const delay = retryDelayMs(response.headers, attempt);
          console.error(`[kaiten-mcp] ${response.status}, retry in ${delay}ms (${attempt}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error(
            `Kaiten auth error ${response.status}: check KAITEN_TOKEN is valid and has the required permissions.`,
          );
        }

        const text = await response.text();
        throw new Error(formatApiError(response.status, text));
      } catch (error) {
        clearTimeout(timer);
        if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
          console.error(`[kaiten-mcp] Timeout, retry (${attempt}/${MAX_RETRIES})`);
          continue;
        }
        throw error;
      }
    }
    throw new Error("Kaiten API: all retries exhausted.");
  } finally {
    releaseSlot();
  }
}

export const kaitenGet = (path: string): Promise<unknown> => kaitenRequest("GET", path);
export const kaitenPost = (path: string, body?: unknown): Promise<unknown> => kaitenRequest("POST", path, body);
export const kaitenPatch = (path: string, body?: unknown): Promise<unknown> => kaitenRequest("PATCH", path, body);
export const kaitenPut = (path: string, body?: unknown): Promise<unknown> => kaitenRequest("PUT", path, body);
export const kaitenDelete = (path: string): Promise<unknown> => kaitenRequest("DELETE", path);

export {
  resolveBaseUrl as _resolveBaseUrl,
  getAuthHeader as _getAuthHeader,
  formatApiError as _formatApiError,
  retryDelayMs as _retryDelayMs,
};
