/**
 * 1C:Enterprise REST/OData client.
 *
 * Uses BaseHttpClient + BasicAuthStrategy from @theyahia/mcp-core.
 * Re-exports oneCGet/oneCPost/oneCPatch + buildODataPath as functional API
 * so tools/* can keep their signatures unchanged across the v1 → v2 migration.
 */

import { BaseHttpClient, BasicAuthStrategy, createLogger } from "@theyahia/mcp-core";
import { enrichOneCError } from "./lib/errors.js";
import { guardWrite } from "./lib/write-safety.js";

const logger = createLogger("aprovodka");

/** Wrap a request promise to enrich 1C errors with Russian-aware hints. */
async function withOneCErrorEnrichment<T>(p: Promise<T>): Promise<T> {
  try {
    return await p;
  } catch (e) {
    throw enrichOneCError(e);
  }
}

/**
 * Адрес публикации OData. Экспортирован, потому что процессные кэши
 * (`src/tools/metadata.ts`) обязаны быть привязаны к базе: сменили ONEC_BASE_URL —
 * ответ другой конфигурации нельзя выдавать из кэша прежней.
 */
export function getBaseUrl(): string {
  const url = process.env["ONEC_BASE_URL"] ?? process.env["1C_BASE_URL"];
  if (!url) {
    throw new Error(
      "ONEC_BASE_URL is required (e.g. http://server:8080/base). Backward-compat alias: 1C_BASE_URL.",
    );
  }
  return url.replace(/\/+$/, "");
}

function getCredentials(): { login: string; password: string } {
  const login = process.env["ONEC_LOGIN"] ?? process.env["1C_LOGIN"];
  const password = process.env["ONEC_PASSWORD"] ?? process.env["1C_PASSWORD"];
  if (!login || !password) {
    throw new Error(
      "ONEC_LOGIN and ONEC_PASSWORD are required for HTTP Basic auth. Backward-compat aliases: 1C_LOGIN, 1C_PASSWORD.",
    );
  }
  return { login, password };
}

function createOneCClient(): BaseHttpClient {
  const { login, password } = getCredentials();
  return new BaseHttpClient({
    baseUrl: getBaseUrl(),
    timeout: 15_000,
    maxRetries: 3,
    auth: new BasicAuthStrategy(login, password),
    logger,
    headers: { Accept: "application/json" },
  });
}

let _client: BaseHttpClient | null = null;
function getClient(): BaseHttpClient {
  if (!_client) _client = createOneCClient();
  return _client;
}

/** Reset cached client (used by tests). */
export function resetClient(): void {
  _client = null;
}

/**
 * Escape a value for safe use inside an OData string literal ('…').
 * OData/1C escape a single quote by doubling it; this stops a quote in
 * user- or LLM-supplied data from breaking out of the literal ($filter injection).
 */
export function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

/** A 1C Ref_Key is a standard UUID; used to validate keyed-path input. */
export const GUID_RE =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Build OData path with optional query parameters.
 * Preserves $-prefixed keys (OData system options) without URL-encoding the $.
 */
export function buildODataPath(
  entity: string,
  query?: Record<string, string>,
): string {
  if (!query || Object.keys(query).length === 0) {
    return `/odata/standard.odata/${encodeURIComponent(entity)}`;
  }
  const qs = Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `/odata/standard.odata/${encodeURIComponent(entity)}?${qs}`;
}

// ──────────────────────────────────────────────────────────────
// Потолок одновременных запросов — на весь процесс, не на вызов
// ──────────────────────────────────────────────────────────────

/**
 * У клиента на тарифе «Базовый» 1С:Фреш всего два сеанса. Три batch-инструмента
 * со своим пулом на вызов давали до 3 × 20 = 60 параллельных соединений и
 * выбивали пользователя из его же базы. Поэтому ограничитель один на процесс и
 * стоит в самой нижней точке — вокруг фактического HTTP-запроса, а не вокруг
 * инструмента: guardWrite успевает сделать вложенное чтение до записи, и обёртка
 * уровнем выше запирала бы сама себя.
 *
 * ponytail: счётчик одновременности, а не rate limiter по времени — сеансы
 * расходует именно одновременность.
 */
export const DEFAULT_MAX_CONCURRENCY = 8;

function maxConcurrency(): number {
  const n = Number(process.env["ONEC_MAX_CONCURRENCY"]);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : DEFAULT_MAX_CONCURRENCY;
}

let inFlight = 0;
const waiting: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (inFlight < maxConcurrency() && waiting.length === 0) {
    inFlight++;
    return;
  }
  // Освобождающий слот передаёт его следующему в очереди, не трогая счётчик, —
  // иначе между decrement и продолжением ожидающего успевает вклиниться новый
  // вызов, и потолок оказывается превышен.
  await new Promise<void>((resolve) => waiting.push(resolve));
}

function releaseSlot(): void {
  const next = waiting.shift();
  if (next) next();
  else inFlight--;
}

/** Каждый HTTP-запрос к 1С проходит здесь — единственная точка учёта сеансов. */
async function limited<T>(fn: () => Promise<T>): Promise<T> {
  await acquireSlot();
  try {
    return await fn();
  } finally {
    releaseSlot();
  }
}

export async function oneCGet(
  path: string,
  opts?: { timeout?: number },
): Promise<unknown> {
  return withOneCErrorEnrichment(
    limited(() => getClient().request({ method: "GET", path, timeout: opts?.timeout })),
  );
}

/**
 * Unguarded write. Every 1C mutation in this server goes through here, so the
 * write-safety guard (preview / approval / audit / rollback) wraps exactly this
 * one function in oneCPost/oneCPatch/oneCDelete below — a new write tool cannot
 * accidentally bypass it.
 */
export async function oneCRawWrite(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<unknown> {
  return withOneCErrorEnrichment(limited(() => getClient().request({ method, path, body })));
}

export async function oneCPost(path: string, body: unknown): Promise<unknown> {
  return guardWrite({ method: "POST", path, body }, () => oneCRawWrite("POST", path, body), oneCGet);
}

export async function oneCPatch(path: string, body: unknown): Promise<unknown> {
  return guardWrite({ method: "PATCH", path, body }, () => oneCRawWrite("PATCH", path, body), oneCGet);
}

export async function oneCDelete(path: string): Promise<unknown> {
  return guardWrite({ method: "DELETE", path }, () => oneCRawWrite("DELETE", path), oneCGet);
}

/**
 * Build a keyed OData path: `Entity(guid'GUID')[/Action][?query]`.
 *
 * The entity name is URL-encoded (Cyrillic-safe), but the key tuple `(guid'…')`
 * and bound action segment (`/Post`, `/Unpost`) are structural and left intact —
 * `buildODataPath` can't be reused here because it would percent-encode the `/`
 * of the action. Matches 1C:Enterprise OData 3.0 addressing.
 */
export function buildKeyedPath(
  entity: string,
  refKey: string,
  action?: string,
  query?: Record<string, string>,
): string {
  // Guard: refKey is interpolated into the path inside guid'…'. Validating it as
  // a GUID makes OData injection through the key impossible, regardless of caller.
  if (!GUID_RE.test(refKey)) {
    throw new Error(
      `Invalid Ref_Key (expected a GUID like 01234567-89ab-cdef-0123-456789abcdef): ${refKey}`,
    );
  }
  const keyed = `${encodeURIComponent(entity)}(guid'${refKey}')`;
  const tail = action ? `/${action}` : "";
  const qs =
    query && Object.keys(query).length > 0
      ? "?" +
        Object.entries(query)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&")
      : "";
  return `/odata/standard.odata/${keyed}${tail}${qs}`;
}

/**
 * Percent-encode only the characters that let a value escape its path segment.
 *
 * `escapeODataString` closes the OData literal (a quote can't break out), but it
 * says nothing about the URL: a `?` or `#` inside an argument still terminates
 * the path for the WHATWG parser inside fetch, so the value silently becomes a
 * query string or a fragment and overrides the caller's own `$format=json`.
 * That is a real injection, not a theoretical one — hence this second layer.
 *
 * OData call syntax (`' ( ) , = :`) must survive, so encodeURIComponent is not
 * usable here: it would eat `= , :` and break the call.
 */
function encodePathLiteral(value: string): string {
  return value.replace(
    /[%?#/&\s]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
  );
}

/**
 * Build a virtual-table OData path:
 * `Entity/Table(Arg=<literal>,…)[?query]` — register balances and turnovers.
 *
 * `buildODataPath` cannot be reused: it runs the whole entity through
 * `encodeURIComponent`, which percent-encodes `/ = , :` and so cannot express a
 * call at all. Here the entity name is still encoded (Cyrillic-safe) while the
 * call syntax stays literal, and every argument value goes through
 * `encodePathLiteral` so it cannot terminate the path or inject a query param.
 * Values are expected to be ready OData literals (`datetime'…'`, `'…'`) —
 * escape their contents with `escapeODataString` before passing them in.
 *
 * READ-ONLY by contract. `parsePath` in lib/write-safety.ts reads the segment
 * after the entity as a bound action and `inverseOf` branches on `Post`/`Unpost`,
 * so routing a write through a path of this shape would produce a bogus rollback.
 */
export function buildVirtualTablePath(
  entity: string,
  table: string,
  args?: Record<string, string>,
  query?: Record<string, string>,
): string {
  // Structural backstop — callers whitelist the table, this only guarantees the
  // name cannot itself carry path syntax.
  if (!/^[A-Za-z]+$/.test(table)) {
    throw new Error(`Invalid virtual table name (expected letters only): ${table}`);
  }
  const argList = Object.entries(args ?? {})
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodePathLiteral(v)}`)
    .join(",");
  const qs =
    query && Object.keys(query).length > 0
      ? "?" +
        Object.entries(query)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&")
      : "";
  return `/odata/standard.odata/${encodeURIComponent(entity)}/${table}(${argList})${qs}`;
}
