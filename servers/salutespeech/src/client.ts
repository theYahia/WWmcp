import { createLogger } from "@theyahia/mcp-core";
import type { OAuthTokenResponse } from "./types.js";

const logger = createLogger("salutespeech-mcp");

export const API_BASE = "https://smartspeech.sber.ru/rest/v1";
const OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const TIMEOUT = 60_000;
const MAX_RETRIES = 3;

// OAuth scope: SALUTE_SPEECH_PERS (individuals), SALUTE_SPEECH_CORP (legal, postpaid),
// SALUTE_SPEECH_B2B (legal, prepaid), or legacy SBER_SPEECH. Default = personal.
function getScope(): string {
  return process.env.SALUTE_SPEECH_SCOPE || "SALUTE_SPEECH_PERS";
}

// Node TLS error codes raised when the Russian Trusted Root CA (НУЦ Минцифры) is missing.
const TLS_CERT_CODES = new Set([
  "SELF_SIGNED_CERT_IN_CHAIN",
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "DEPTH_ZERO_SELF_SIGNED_CERT",
  "CERT_UNTRUSTED",
]);

/** If the error is a Sber TLS-trust failure, rewrap it with an actionable hint. */
export function maybeTlsHint(error: unknown): unknown {
  const err = error as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const code = err?.cause?.code ?? err?.code;
  const msg = String(err?.cause?.message ?? err?.message ?? "");
  const looksLikeTls =
    (code !== undefined && TLS_CERT_CODES.has(code)) ||
    /self[- ]signed certificate|unable to verify|unable to get local issuer/i.test(msg);
  if (!looksLikeTls) return error;
  return new Error(
    `TLS certificate verification failed talking to Sber (${code ?? "cert error"}). Sber endpoints use the ` +
      `Russian Trusted Root CA (НУЦ Минцифры), absent from Node's default trust store. Install it and set ` +
      `NODE_EXTRA_CA_CERTS to the russian_trusted_root_ca_pem.crt path (download: https://www.gosuslugi.ru/crt). ` +
      `Do NOT set NODE_TLS_REJECT_UNAUTHORIZED=0 in production. Docs: ` +
      `https://developers.sber.ru/docs/ru/salutespeech/certificates`,
  );
}

export function getAuthKey(): string {
  // Priority 1: direct SALUTESPEECH_API_KEY
  if (process.env.SALUTESPEECH_API_KEY) {
    return process.env.SALUTESPEECH_API_KEY;
  }
  // Priority 2: legacy SALUTE_AUTH_KEY
  if (process.env.SALUTE_AUTH_KEY) {
    return process.env.SALUTE_AUTH_KEY;
  }
  // Priority 3: CLIENT_ID + CLIENT_SECRET → Base64
  const clientId = process.env.SALUTE_SPEECH_CLIENT_ID;
  const clientSecret = process.env.SALUTE_SPEECH_CLIENT_SECRET;
  if (clientId && clientSecret) {
    return Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  }
  throw new Error(
    "Auth not configured. Set SALUTESPEECH_API_KEY, or SALUTE_AUTH_KEY, or SALUTE_SPEECH_CLIENT_ID + SALUTE_SPEECH_CLIENT_SECRET"
  );
}

class TokenManager {
  private token: string | null = null;
  private expiresAt = 0;

  async getToken(): Promise<string> {
    const now = Date.now();
    if (this.token && now < this.expiresAt - 60_000) {
      return this.token;
    }

    const authKey = getAuthKey();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(OAUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "Authorization": `Basic ${authKey}`,
          "RqUID": crypto.randomUUID(),
        },
        body: `scope=${encodeURIComponent(getScope())}`,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`OAuth error ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as OAuthTokenResponse;
      this.token = data.access_token;
      this.expiresAt = data.expires_at;
      return this.token;
    } catch (error) {
      clearTimeout(timer);
      throw maybeTlsHint(error);
    }
  }
}

const tokenManager = new TokenManager();

export async function salutePost(path: string, body: unknown, contentType = "application/json"): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const token = await tokenManager.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const isJson = contentType === "application/json";
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": contentType,
          "Accept": "application/json",
        },
        body: isJson ? JSON.stringify(body) : (body as BodyInit),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response;

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        logger.warn("Retryable error, backing off", { status: response.status, delay, attempt });
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text().catch(() => "");
      throw new Error(`SaluteSpeech HTTP ${response.status}: ${text || response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        logger.warn("Request timeout, retrying", { attempt });
        continue;
      }
      throw error;
    }
  }
  throw new Error("SaluteSpeech: all retries exhausted");
}

export async function saluteGet(path: string): Promise<Response> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const token = await tokenManager.getToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) return response;

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }

      const text = await response.text().catch(() => "");
      throw new Error(`SaluteSpeech HTTP ${response.status}: ${text || response.statusText}`);
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        continue;
      }
      throw error;
    }
  }
  throw new Error("SaluteSpeech: all retries exhausted");
}
