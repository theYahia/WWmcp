/**
 * MoySklad API client.
 *
 * Uses BaseHttpClient (retry / timeout / SSRF guard) and DualAuthStrategy
 * (Bearer token or Basic login/password fallback) from @theyahia/mcp-core,
 * plus core's TokenBucketLimiter for MoySklad's 45 req / 3s budget.
 *
 * The limiter is held here rather than using RateLimitedClient because
 * MoySklad charges some endpoints more than one unit — the stock reports cost
 * 5 each — and the shared client always spends exactly one per request.
 */

import { ApiError, BaseHttpClient, DualAuthStrategy, TokenBucketLimiter, createLogger } from "@theyahia/mcp-core";

const logger = createLogger("moysklad-mcp");

const client = new BaseHttpClient({
  baseUrl: "https://api.moysklad.ru/api/remap/1.2",
  timeout: 15_000,
  maxRetries: 3,
  auth: new DualAuthStrategy({
    token: process.env.MOYSKLAD_TOKEN,
    login: process.env.MOYSKLAD_LOGIN,
    password: process.env.MOYSKLAD_PASSWORD,
  }),
  logger,
  headers: {
    "Content-Type": "application/json;charset=utf-8",
    Accept: "application/json;charset=utf-8",
  },
});

const limiter = new TokenBucketLimiter(45, 3000);

/**
 * Turn a MoySklad error body (`{ errors: [{ error, error_message, parameter, code }] }`)
 * into one readable line.
 *
 * The core client puts the raw body on `ApiError.body` and builds the message from the
 * status line alone, but `createToolError` only forwards the message — so without this
 * the model sees "HTTP 400: Bad Request" and never learns which field MoySklad rejected.
 */
function moyskladErrorMessage(body: string | undefined): string | undefined {
  if (!body) return undefined;
  try {
    const errs = (JSON.parse(body) as { errors?: Array<Record<string, unknown>> })?.errors;
    if (!Array.isArray(errs) || errs.length === 0) return undefined;
    return errs
      .map((e) => {
        const code = e.code ? `[${String(e.code)}] ` : "";
        const head = e.error ? String(e.error) : "";
        const detail = e.error_message ? ` — ${String(e.error_message)}` : "";
        const param = e.parameter ? ` (параметр: ${String(e.parameter)})` : "";
        return `${code}${head}${detail}${param}`.trim();
      })
      .filter(Boolean)
      .join("; ");
  } catch {
    // body wasn't MoySklad JSON — leave the core message as it is
    return undefined;
  }
}

/**
 * Spend `weight` rate-limit units, run the request, and re-throw API errors with
 * MoySklad's own explanation attached.
 */
async function call<T>(weight: number, run: () => Promise<T>): Promise<T> {
  for (let i = 0; i < weight; i++) await limiter.acquire();
  try {
    return await run();
  } catch (error) {
    if (error instanceof ApiError) {
      const detail = moyskladErrorMessage(error.body);
      if (detail) {
        throw new ApiError(error.status, `${error.message} — ${detail}`, error.body, error.headers, error.code);
      }
    }
    throw error;
  }
}

export async function moyskladGet(path: string, weight = 1): Promise<unknown> {
  return call(weight, () => client.get(path));
}

export async function moyskladPost(path: string, body: unknown, weight = 1): Promise<unknown> {
  return call(weight, () => client.post(path, body));
}

export async function moyskladPut(path: string, body: unknown, weight = 1): Promise<unknown> {
  return call(weight, () => client.put(path, body));
}

export async function moyskladDelete(path: string, weight = 1): Promise<unknown> {
  return call(weight, () => client.delete(path));
}

/** Test hook: the error-body parser, exercised in tests/client.test.ts. */
export { moyskladErrorMessage as _moyskladErrorMessage };
