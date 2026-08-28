import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { VERSION } from "./version.js";

// --- Конфигурация ---
const BASE_URL = (process.env.HUNTFLOW_BASE_URL || "https://api.huntflow.ru/v2").replace(
  /\/+$/,
  "",
);
const MAX_RETRIES = 3;
const RATE_LIMIT_PER_SEC = 10; // документированный лимит Huntflow: 10 req/s на токен

// Настройки читаются в рантайме (не на этапе импорта), чтобы хост/тесты могли
// задать env до первого запроса; это надёжнее и тестируемее.
const timeoutMs = () => Number(process.env.HUNTFLOW_TIMEOUT_MS) || 10_000;
const backoffBaseMs = () =>
  process.env.HUNTFLOW_BACKOFF_MS !== undefined ? Number(process.env.HUNTFLOW_BACKOFF_MS) : 1000;
const rateLimitDisabled = () => process.env.HUNTFLOW_DISABLE_RATELIMIT === "1";
// User-Agent ОБЯЗАТЕЛЕН — без него API отдаёт 400 bad_user_agent.
const userAgent = () =>
  process.env.HUNTFLOW_USER_AGENT ||
  `huntflow-mcp/${VERSION} (+https://github.com/theYahia/huntflow-mcp)`;
const tokenFile = () =>
  process.env.HUNTFLOW_TOKEN_FILE || join(homedir(), ".huntflow-mcp", "token.json");

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// --- Состояние токенов ---
interface TokenPair {
  access_token: string;
  refresh_token?: string;
}

let state: TokenPair | null = null; // актуальная пара в памяти
let envSeed: TokenPair | null = null; // пара из env (fallback при перевыпуске)
let initialized = false;
let refreshPromise: Promise<void> | null = null;

function readEnvTokens(): TokenPair | null {
  const access = process.env.HUNTFLOW_TOKEN;
  if (!access) return null;
  return { access_token: access, refresh_token: process.env.HUNTFLOW_REFRESH_TOKEN || undefined };
}

async function loadFileTokens(): Promise<TokenPair | null> {
  try {
    const data = JSON.parse(await fs.readFile(tokenFile(), "utf8"));
    if (data && typeof data.access_token === "string" && data.access_token) {
      return { access_token: data.access_token, refresh_token: data.refresh_token || undefined };
    }
  } catch {
    /* нет файла / битый JSON — игнорируем, сидируемся из env */
  }
  return null;
}

async function persistTokens(pair: TokenPair): Promise<void> {
  const file = tokenFile();
  try {
    await fs.mkdir(dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(pair, null, 2), { mode: 0o600 });
    await fs.chmod(file, 0o600).catch(() => {}); // на Windows — no-op
  } catch (e) {
    console.error(`[huntflow-mcp] не удалось сохранить токен в ${file}: ${(e as Error).message}`);
  }
}

async function ensureInit(): Promise<void> {
  if (initialized) return;
  envSeed = readEnvTokens();
  const fileTokens = await loadFileTokens();
  // Файл имеет приоритет: там последняя ротированная пара после рефрешей.
  state = fileTokens ?? envSeed;
  if (!state) {
    throw new Error(
      "HUNTFLOW_TOKEN обязателен. Получите в настройках HuntFlow: Настройки → API-токены.",
    );
  }
  initialized = true;
}

// --- Rate limiter (token bucket) ---
let rlTokens = RATE_LIMIT_PER_SEC;
let rlLast = Date.now();

async function acquireRateToken(): Promise<void> {
  if (rateLimitDisabled()) return;
  for (;;) {
    const now = Date.now();
    rlTokens = Math.min(
      RATE_LIMIT_PER_SEC,
      rlTokens + ((now - rlLast) / 1000) * RATE_LIMIT_PER_SEC,
    );
    rlLast = now;
    if (rlTokens >= 1) {
      rlTokens -= 1;
      return;
    }
    await sleep(Math.ceil(((1 - rlTokens) / RATE_LIMIT_PER_SEC) * 1000));
  }
}

// --- Низкоуровневый fetch (без рекурсивного refresh) ---
async function rawFetch(
  method: string,
  path: string,
  opts: { body?: unknown; auth?: string | null } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs());
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": userAgent(),
    };
    if (opts.auth) headers["Authorization"] = `Bearer ${opts.auth}`;
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(opts.body);
    }
    return await fetch(`${BASE_URL}${path}`, { method, headers, body, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- Парсинг тела ошибки Huntflow ---
async function parseError(response: Response): Promise<string> {
  let text = "";
  try {
    text = await response.text();
  } catch {
    /* нет тела */
  }
  if (text) {
    try {
      const data = JSON.parse(text);
      // Основная форма API: { errors: [{ type, value }] }
      if (Array.isArray(data?.errors) && data.errors.length) {
        return data.errors
          .map((e: { type?: string; value?: unknown }) => {
            const val = Array.isArray(e?.value) ? e.value.join(", ") : (e?.value ?? "");
            return e?.type ? `${e.type}${val ? `: ${val}` : ""}` : String(val || JSON.stringify(e));
          })
          .join("; ");
      }
      // OAuth-форма: { error, error_description }
      if (data?.error) {
        return data.error_description
          ? `${data.error}: ${data.error_description}`
          : String(data.error);
      }
    } catch {
      /* не JSON — вернём как есть */
    }
    return text.slice(0, 300);
  }
  return `${response.status} ${response.statusText}`;
}

// --- Refresh токена ---
function canRefresh(): boolean {
  return !!state?.refresh_token;
}

async function performRefresh(): Promise<void> {
  const rt = state?.refresh_token;
  if (!rt) throw new Error("нет refresh_token");
  // POST /token/refresh принимает JSON { refresh_token }, без Authorization.
  const resp = await rawFetch("POST", "/token/refresh", {
    body: { refresh_token: rt },
    auth: null,
  });
  if (!resp.ok) {
    throw new Error(await parseError(resp));
  }
  const data = (await resp.json()) as { access_token?: string; refresh_token?: string };
  if (!data?.access_token) throw new Error("refresh: в ответе нет access_token");
  state = { access_token: data.access_token, refresh_token: data.refresh_token || rt };
  await persistTokens(state);
}

async function doRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  try {
    await refreshPromise;
    return true;
  } catch {
    return false;
  }
}

function hasDistinctEnvTokens(): boolean {
  if (!envSeed) return false;
  return (
    envSeed.access_token !== state?.access_token ||
    (!!envSeed.refresh_token && envSeed.refresh_token !== state?.refresh_token)
  );
}

// --- Хелперы запроса ---
function buildQuery(query?: Record<string, string | number | boolean | undefined>): string {
  if (!query) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

function jitter(ms: number): number {
  return Math.round(ms * (0.5 + Math.random() * 0.5)); // 50–100% от base
}

async function backoff(attempt: number, retryAfterMs?: number): Promise<void> {
  const base = Math.min(backoffBaseMs() * 2 ** (attempt - 1), 8000);
  const delay = retryAfterMs && retryAfterMs > 0 ? Math.max(retryAfterMs, base) : jitter(base);
  if (delay > 0) await sleep(delay);
}

function parseRetryAfter(resp: Response): number | undefined {
  const h = resp.headers?.get?.("retry-after");
  if (!h) return undefined;
  const secs = Number(h);
  if (!Number.isNaN(secs)) return secs * 1000;
  const date = Date.parse(h);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}

function isRetriableNetworkError(err: unknown): boolean {
  if (err instanceof DOMException && err.name === "AbortError") return true; // таймаут
  if (err instanceof Error) {
    const code = (err as Error & { cause?: { code?: string } }).cause?.code;
    if (
      typeof code === "string" &&
      ["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "ECONNREFUSED", "EPIPE", "ENOTFOUND"].includes(code)
    ) {
      return true;
    }
    if (err.name === "TypeError" && /fetch failed/i.test(err.message)) return true;
  }
  return false;
}

function normalizeNetworkError(err: unknown): Error {
  if (err instanceof DOMException && err.name === "AbortError") {
    return new Error(`HuntFlow: таймаут запроса (${timeoutMs()}ms)`);
  }
  if (err instanceof Error) return new Error(`HuntFlow: сетевая ошибка — ${err.message}`);
  return new Error("HuntFlow: неизвестная сетевая ошибка");
}

/**
 * Единая точка HTTP-запросов к Huntflow API.
 * Обрабатывает: User-Agent, авторизацию, auto-refresh на 401, retry на 429/5xx/сети, rate limit.
 */
export async function hfRequest(
  method: string,
  path: string,
  opts: { query?: Record<string, string | number | boolean | undefined>; body?: unknown } = {},
): Promise<unknown> {
  await ensureInit();
  await acquireRateToken();

  const fullPath = `${path}${buildQuery(opts.query)}`;

  let attempt = 0; // считаем ТОЛЬКО ретраи 429/5xx/сети, не refresh
  let triedRefresh = false;
  let triedEnvFallback = false;

  for (;;) {
    let response: Response;
    try {
      response = await rawFetch(method, fullPath, { body: opts.body, auth: state!.access_token });
    } catch (err) {
      if (isRetriableNetworkError(err) && attempt + 1 < MAX_RETRIES) {
        attempt++;
        await backoff(attempt);
        continue;
      }
      throw normalizeNetworkError(err);
    }

    if (response.ok) {
      return await response.json();
    }

    const status = response.status;
    const errText = await parseError(response);

    if (status === 401) {
      // Сначала пробуем refresh (access живёт ≤7 дней, протух → 401).
      if (canRefresh() && !triedRefresh) {
        triedRefresh = true;
        if (await doRefresh()) continue;
      }
      // Если refresh не помог, а в env лежит другая (перевыпущенная) пара — переключаемся на неё.
      if (!triedEnvFallback && hasDistinctEnvTokens()) {
        triedEnvFallback = true;
        triedRefresh = false; // разрешить refresh уже env-токеном
        state = { ...envSeed! };
        await persistTokens(state);
        continue;
      }
      throw new Error(
        `HuntFlow 401: ${errText}. Проверьте/перевыпустите токен (Настройки → API-токены).`,
      );
    }

    if ((status === 429 || status >= 500) && attempt + 1 < MAX_RETRIES) {
      attempt++;
      await backoff(attempt, parseRetryAfter(response));
      continue;
    }

    throw new Error(`HuntFlow HTTP ${status}: ${errText}`);
  }
}

/** GET-обёртка: путь уже содержит query-string (как строят тулы). */
export async function hfGet(path: string): Promise<unknown> {
  return hfRequest("GET", path);
}

/** Сброс состояния модуля — только для тестов. */
export function __resetClientForTests(): void {
  state = null;
  envSeed = null;
  initialized = false;
  refreshPromise = null;
  rlTokens = RATE_LIMIT_PER_SEC;
  rlLast = Date.now();
}
