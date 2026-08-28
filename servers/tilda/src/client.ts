import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("tilda-mcp");

const BASE_URL = "https://api.tildacdn.info/v1";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;
const RETRY_CAP = 60_000; // never wait longer than this between retries

/** Parse an HTTP `Retry-After` header (delta-seconds or HTTP-date) into milliseconds. */
function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const when = Date.parse(header);
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  return null;
}

export async function tildaGet<T = unknown>(method: string, params: Record<string, string> = {}): Promise<T> {
  const publicKey = process.env.TILDA_PUBLIC_KEY;
  const secretKey = process.env.TILDA_SECRET_KEY;
  if (!publicKey || !secretKey) throw new Error("TILDA_PUBLIC_KEY и TILDA_SECRET_KEY не заданы");

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const query = new URLSearchParams({
      ...params,
      publickey: publicKey,
      secretkey: secretKey,
    });

    try {
      const response = await fetch(`${BASE_URL}/${method}/?${query.toString()}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json() as { status?: string; result?: T; message?: string };
        if (data.status === "ERROR") throw new Error(`Tilda ошибка: ${data.message ?? "неизвестная ошибка"}`);
        return (data.result ?? data) as T;
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const backoff = Math.min(1000 * 2 ** (attempt - 1), 8000);
        const retryAfter = parseRetryAfter(response.headers.get("retry-after"));
        const delay = Math.min(Math.max(retryAfter ?? 0, backoff), RETRY_CAP);
        logger.warn("Повтор запроса после ошибки", { status: response.status, delay, attempt, maxRetries: MAX_RETRIES, method });
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      throw new Error(`Tilda HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        logger.warn("Таймаут, повтор", { attempt, maxRetries: MAX_RETRIES, method });
        continue;
      }
      throw error;
    }
  }
  throw new Error("Tilda API: все попытки исчерпаны");
}

// Exported for testing — allows injecting a mock fetch
export { BASE_URL, TIMEOUT, MAX_RETRIES, RETRY_CAP, parseRetryAfter };
