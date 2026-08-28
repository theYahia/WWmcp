const BASE_URL = "https://api.calltouch.ru";
const TIMEOUT = 15_000;
const MAX_RETRIES = 3;

function getToken(): string {
  const token = process.env.CALLTOUCH_TOKEN;
  if (!token) {
    throw new Error("Переменная окружения CALLTOUCH_TOKEN не задана");
  }
  return token;
}

export function getSiteId(): string {
  const siteId = process.env.CALLTOUCH_SITE_ID;
  if (!siteId) {
    throw new Error("Переменная окружения CALLTOUCH_SITE_ID не задана");
  }
  return siteId;
}

async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);

      if (response.ok) return response;

      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[calltouch-mcp] ${response.status} от ${url}, повтор через ${delay}мс (${attempt}/${retries})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const body = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${response.statusText}. ${body}`);
    } catch (error) {
      clearTimeout(timer);
      if (attempt === retries) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        console.error(`[calltouch-mcp] Таймаут ${url}, повтор (${attempt}/${retries})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("Все попытки исчерпаны");
}

export async function apiGet(path: string, params: Record<string, string> = {}): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  const response = await fetchWithRetry(url.toString(), {
    headers: {
      "Access-Token": getToken(),
      "Content-Type": "application/json",
    },
  });
  return response.json();
}
