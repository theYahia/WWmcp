/**
 * Configuration and credential resolution for the Diadoc client.
 *
 * Diadoc authentication uses two distinct things:
 *  - the "developer key" (a.k.a. `ddauth_api_client_id`) issued when you register
 *    for API access — supplied via `DIADOC_API_CLIENT_ID`;
 *  - a Diadoc account `login` + `password` — supplied via `DIADOC_LOGIN` / `DIADOC_PASSWORD`.
 *
 * The base URL defaults to production but can be overridden (e.g. for the sandbox).
 */

const DEFAULT_BASE_URL = "https://diadoc-api.kontur.ru";

export interface DiadocCredentials {
  /** Developer key sent as the `ddauth_api_client_id` auth parameter. */
  apiClientId: string;
  login: string;
  password: string;
}

/** Base URL of the Diadoc API. Override with `DIADOC_BASE_URL` (e.g. a sandbox host). */
export function getBaseUrl(): string {
  const fromEnv = process.env.DIADOC_BASE_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv.replace(/\/+$/, "") : DEFAULT_BASE_URL;
}

/**
 * The developer key used as `ddauth_api_client_id`.
 * Prefers `DIADOC_API_CLIENT_ID`; falls back to the legacy `DIADOC_CLIENT_ID` for
 * backwards compatibility. (The old, never-used `DIADOC_API_KEY` is intentionally ignored.)
 */
export function getApiClientId(): string {
  return (process.env.DIADOC_API_CLIENT_ID || process.env.DIADOC_CLIENT_ID || "").trim();
}

/**
 * Resolve all required credentials, throwing a clear, actionable error listing
 * whatever is missing. Read lazily so the process can start without credentials
 * and only fail when a tool actually needs to talk to Diadoc.
 */
export function getCredentials(): DiadocCredentials {
  const apiClientId = getApiClientId();
  const login = (process.env.DIADOC_LOGIN || "").trim();
  const password = process.env.DIADOC_PASSWORD || "";

  const missing: string[] = [];
  if (!apiClientId) missing.push("DIADOC_API_CLIENT_ID");
  if (!login) missing.push("DIADOC_LOGIN");
  if (!password) missing.push("DIADOC_PASSWORD");

  if (missing.length > 0) {
    throw new Error(
      `Missing required Diadoc credentials: ${missing.join(", ")}. Set them as environment variables — see the README for how to obtain a developer key.`,
    );
  }

  return { apiClientId, login, password };
}
