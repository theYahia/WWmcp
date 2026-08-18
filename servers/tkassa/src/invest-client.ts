import { createLogger } from "@theyahia/mcp-core";

const logger = createLogger("tkassa-mcp/invest");
const INVEST_BASE = "https://invest-public-api.tinkoff.ru/rest";

export class TInvestClient {
  private readonly token: string;

  constructor() {
    this.token = process.env.TINKOFF_INVEST_TOKEN ?? "";
    // НЕ выбрасываем ошибку в конструкторе — Invest tools опциональны
  }

  isAvailable(): boolean {
    return this.token.length > 0;
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    if (!this.token) {
      throw new Error(
        "TINKOFF_INVEST_TOKEN не задан. " +
        "Создайте токен в приложении Т-Инвестиции: Настройки → Токен для OpenAPI. " +
        "Нужен 'Read-only' или 'Full access' токен."
      );
    }

    const url = `${INVEST_BASE}${path}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
        "x-app-name": "@theyahia/tkassa-mcp",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      logger.error("Invest API error", { path, status: res.status });
      throw new Error(`T-Invest API ${path} → ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }
}

let _invest: TInvestClient | null = null;
export function getInvestClient(): TInvestClient {
  if (!_invest) _invest = new TInvestClient();
  return _invest;
}
