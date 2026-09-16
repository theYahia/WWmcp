import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { Agent, setGlobalDispatcher } from "undici";
import { ApiError, createLogger } from "@theyahia/mcp-core";

// Свой клиент, не BaseHttpClient ядра: один RqUID на все ретраи (иначе дубль платежа),
// OAuth Basic+scope+RqUID с single-flight refresh и mTLS через undici — в ядре этого нет.
const logger = createLogger("sber-mcp");

// --- Конфигурация (всё переопределяемо через env) -------------------------------------------
// Дефолты соответствуют официальной документации СберБизнес API
// (developers.sber.ru/docs/ru/sberbusinessapi, developer.sberbank.ru) на дату ресёрча 2026-06.
// VERIFY: у Сбера сосуществуют поколения v2 (direct) и v3 (partners) с разными путями/портами —
// сверяйте с вашим интеграционным договором и переопределяйте через переменные окружения.

// API-хост (mTLS). Реальный fintech-хост отличается от OAuth-хоста.
const BASE_URL = process.env.SBER_BASE_URL || "https://fintech.sberbank.ru:9443";
// OAuth-эндпоинт живёт на ДРУГОМ host:port, чем API.
const OAUTH_URL =
  process.env.SBER_OAUTH_URL || "https://api.sberbank.ru:8443/prod/tokens/v2/oauth";
// Scope — это space-separated список конкретных имён прав, НЕ один общий scope.
// VERIFY: укажите ровно те scope, что выданы вашему приложению.
const OAUTH_SCOPE =
  process.env.SBER_OAUTH_SCOPE || "GET_STATEMENT_ACCOUNT PAY_DOC_RU GET_CLIENT_ACCOUNTS";
const TIMEOUT = Number(process.env.SBER_TIMEOUT_MS) || 30_000;
const MAX_RETRIES = 3;

// --- mTLS (опционально) ---------------------------------------------------------------------
// Боевой fintech.sberbank.ru требует взаимного TLS с клиентским сертификатом, выданным банком.
// Настраивается один раз перед первым запросом. Без этих env поведение прежнее (обычный TLS) —
// например, для прямого Bearer-токена в тестовом контуре.
let mtlsConfigured = false;
function ensureMtls(): void {
  if (mtlsConfigured) return;
  mtlsConfigured = true;

  const pfxPath = process.env.SBER_PFX_PATH;
  const certPath = process.env.SBER_CERT_PATH;
  const keyPath = process.env.SBER_KEY_PATH;
  const caPath = process.env.SBER_CA_PATH;

  try {
    if (pfxPath) {
      setGlobalDispatcher(
        new Agent({
          connect: {
            pfx: readFileSync(pfxPath),
            passphrase: process.env.SBER_PFX_PASSPHRASE,
          },
        }),
      );
      logger.info("mTLS включён (PFX)");
    } else if (certPath && keyPath) {
      setGlobalDispatcher(
        new Agent({
          connect: {
            cert: readFileSync(certPath),
            key: readFileSync(keyPath),
            ...(caPath ? { ca: readFileSync(caPath) } : {}),
          },
        }),
      );
      logger.info("mTLS включён (CERT/KEY)");
    }
  } catch (error) {
    throw new Error(`[sber-mcp] Не удалось настроить mTLS: ${(error as Error).message}`);
  }
}

// --- Авторизация ----------------------------------------------------------------------------
let oauthToken: string | null = null;
let oauthExpiry = 0;
let inflightToken: Promise<string> | null = null;

/** 32 hex-символа — формат Сбера для RqUID (regex ^[0-9a-fA-F]{32}$). */
export function genRqUid(): string {
  return randomBytes(16).toString("hex");
}

async function getToken(): Promise<string> {
  // Стратегия 1: прямой Bearer-токен.
  const direct = process.env.SBER_TOKEN || process.env.SBER_ACCESS_TOKEN;
  if (direct) return direct;

  // Стратегия 2: OAuth client_credentials.
  const clientId = process.env.SBER_CLIENT_ID;
  const clientSecret = process.env.SBER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "Требуется SBER_TOKEN (Bearer) или SBER_CLIENT_ID + SBER_CLIENT_SECRET (OAuth).",
    );
  }

  if (oauthToken && Date.now() < oauthExpiry) return oauthToken;
  // Guard от конкурентного refresh: параллельные вызовы ждут один in-flight запрос токена.
  if (inflightToken) return inflightToken;

  inflightToken = (async () => {
    // Сбер ожидает Basic-auth (base64 client_id:client_secret) + form-body grant_type/scope + RqUID.
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(OAUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        RqUID: genRqUid(),
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: OAUTH_SCOPE,
      }),
    });

    if (!response.ok) {
      throw new ApiError(response.status, `OAuth ошибка ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };
    oauthToken = data.access_token;
    oauthExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh за 60с до истечения
    return oauthToken;
  })();

  try {
    return await inflightToken;
  } finally {
    inflightToken = null;
  }
}

export interface SberFetchOptions {
  method?: string;
  body?: unknown;
  /** Явный ключ идемпотентности; по умолчанию генерируется автоматически для write-операций. */
  rqUid?: string;
}

export async function sberFetch(path: string, options: SberFetchOptions = {}): Promise<unknown> {
  ensureMtls();
  const method = options.method || "GET";
  const isWrite = method !== "GET" && method !== "HEAD";

  // ОДИН стабильный RqUID на логическую операцию, переиспользуемый на КАЖДОМ ретрае. Сбер считает
  // повтор с тем же телом, но другим RqUID — новым запросом, поэтому генерация ключа внутри цикла
  // ретраев привела бы к дублю платежа. Header (x-Introspect-RqUID) и тело rq_uid должны совпадать.
  const rqUid = isWrite ? (options.rqUid ?? genRqUid()) : undefined;

  let body = options.body;
  if (isWrite && rqUid && body && typeof body === "object" && !Array.isArray(body)) {
    body = { rq_uid: rqUid, ...(body as Record<string, unknown>) };
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const token = await getToken();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };
      if (rqUid) headers["x-Introspect-RqUID"] = rqUid;

      const init: RequestInit = { method, headers, signal: controller.signal };
      if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${path}`, init);
      clearTimeout(timer);

      if (response.ok) return response.json();

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        logger.warn(`HTTP ${response.status}, повтор через ${delay}мс`, {
          path,
          attempt,
          maxRetries: MAX_RETRIES,
        });
        if (response.status >= 500 && isWrite) {
          logger.warn(
            "HTTP 5xx на записи — результат операции не определён; повтор с тем же RqUID " +
              "(Сбер дедуплицирует по нему). Если попытки исчерпаны — проверьте статус через get_payment_status.",
          );
        }
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      const hint =
        response.status === 401
          ? " Проверьте SBER_TOKEN или SBER_CLIENT_ID/SBER_CLIENT_SECRET."
          : "";
      // ApiError со статусом — withErrorHandling ядра разводит 401/403/404/429/5xx по категориям.
      throw new ApiError(
        response.status,
        `Сбербанк HTTP ${response.status}: ${response.statusText}${hint}`,
      );
    } catch (error) {
      clearTimeout(timer);
      const isAbort = error instanceof DOMException && error.name === "AbortError";
      const isNetwork = error instanceof TypeError; // транзиентный сетевой сбой (ECONNRESET и т.п.)
      if ((isAbort || isNetwork) && attempt < MAX_RETRIES) {
        logger.warn(isAbort ? "Таймаут, повтор" : "Сетевая ошибка, повтор", {
          attempt,
          maxRetries: MAX_RETRIES,
        });
        continue;
      }
      throw error;
    }
  }
  throw new Error("Сбербанк API: все попытки исчерпаны");
}
