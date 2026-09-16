const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 3;

/** Таймаут запроса в мс. Переопределяется через ELMA365_TIMEOUT. */
function getTimeout(): number {
  const raw = process.env.ELMA365_TIMEOUT;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT;
}

export function getDomain(): string {
  const domain = process.env.ELMA365_DOMAIN;
  if (!domain) throw new Error("ELMA365_DOMAIN не задан. Укажите домен (например: mycompany)");
  return domain;
}

export function getToken(): string {
  const token = process.env.ELMA365_TOKEN;
  if (!token) throw new Error("ELMA365_TOKEN не задан. Укажите Bearer-токен ELMA365 API");
  return token;
}

/**
 * Базовый URL ELMA365 Public API (`.../pub/v1`).
 *
 * Приоритет:
 *   1. ELMA365_BASE_URL — полный базовый URL (для on-premise / нестандартных хостов).
 *   2. ELMA365_DOMAIN — поддомен облака (`mycompany` → `mycompany.elma365.ru`)
 *      или полный хост (`mycompany.elma365.ru`, `elma365.mycorp.com` для on-premise).
 */
export function getBaseUrl(): string {
  const explicit = process.env.ELMA365_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  const domain = getDomain();
  // Поддерживаем и "mycompany", и полный хост ("mycompany.elma365.ru", on-premise "elma365.corp.com").
  const host = domain.includes(".") ? domain : `${domain}.elma365.ru`;
  return `https://${host}/pub/v1`;
}

export async function elmaRequest(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  endpoint: string,
  body?: Record<string, unknown>,
  params?: Record<string, string>,
): Promise<unknown> {
  const token = getToken();
  const baseUrl = getBaseUrl();
  const timeout = getTimeout();

  // Traversal guard: namespace/code/id tool params form path segments here, and fetch normalises `..`
  // before sending — a crafted value would reach an endpoint no tool exposes,
  // carrying this server's credentials. Checked on the path only, so a query
  // value containing dots is unaffected.
  if (/(^|\/)\.\.(\/|$)/.test(endpoint.split("?")[0]!)) {
    throw new Error(`ELMA365: путь "${endpoint}" содержит переход вверх по дереву ".." — параметры инструмента так выглядеть не должны.`);
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const query = params ? `?${new URLSearchParams(params).toString()}` : "";

    try {
      const response = await fetch(`${baseUrl}/${endpoint}${query}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        const text = await response.text();
        return text ? JSON.parse(text) : { success: true };
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.error(`[elma365-mcp] ${response.status}, повтор через ${delay}мс (${attempt}/${MAX_RETRIES})`);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const errBody = await response.text().catch(() => "");
      throw new Error(`ELMA365 HTTP ${response.status}: ${response.statusText}${errBody ? ` — ${errBody}` : ""}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        console.error(`[elma365-mcp] Таймаут, повтор (${attempt}/${MAX_RETRIES})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error("ELMA365 API: все попытки исчерпаны");
}
