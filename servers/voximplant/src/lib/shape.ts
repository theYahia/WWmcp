import type { VoxAccountInfo } from "../types.js";

/** Берёт только перечисленные ключи, если они присутствуют и не undefined. */
export function pick<T extends Record<string, unknown>>(obj: T, keys: readonly string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (k in obj && obj[k] !== undefined) out[k] = obj[k];
  }
  return out;
}

/** Толерантно: если шейп пустой (форма неожиданная) — вернуть сырое, не теряя данные. */
export function orRaw(shaped: Record<string, unknown>, raw: unknown): unknown {
  return Object.keys(shaped).length === 0 ? raw : shaped;
}

/**
 * Безопасные (не секретные) поля AccountInfoType. Строгий витлист:
 * `api_key`, `callback_salt`, `callback_url`, `access_entries`, `account_custom_data`
 * в него НЕ входят.
 */
export const SAFE_ACCOUNT_FIELDS: readonly (keyof VoxAccountInfo | string)[] = [
  "account_id",
  "account_name",
  "account_email",
  "account_first_name",
  "account_last_name",
  "active",
  "frozen",
  "balance",
  "live_balance",
  "credit_limit",
  "currency",
  "created",
  "language_code",
  "location",
  "a2p_sms_enabled",
  "billing_limits",
  "support_bank_card",
  "support_invoice",
];

interface AccountResponse {
  result?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Строгая редакция ответа GetAccountInfo. GetAccountInfo эхо-возвращает `api_key`
 * (и `callback_salt`) аккаунта — это credential-disclosure при сыром дампе.
 * Берём ТОЛЬКО безопасные поля, БЕЗ orRaw-фолбэка, чтобы секрет не утёк даже
 * при неожиданной форме ответа.
 */
export function shapeAccountInfo(resp: unknown): Record<string, unknown> {
  const r = (resp ?? {}) as AccountResponse;
  const account = (r.result ?? r) as Record<string, unknown>;
  return { result: pick(account, SAFE_ACCOUNT_FIELDS) };
}
