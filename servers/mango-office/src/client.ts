import { createHmac } from "node:crypto";
import { ApiError, createLogger } from "@theyahia/mcp-core";

const BASE_URL = "https://app.mango-office.ru/vpbx";
const TIMEOUT = 10_000;
const MAX_RETRIES = 3;

const logger = createLogger("mango-office-mcp");

// ponytail: core BaseHttpClient JSON-stringifies the body and sends
// application/json. Mango needs application/x-www-form-urlencoded with an
// HMAC computed over the JSON string, so the fetch loop stays local. Core
// still supplies the logger and ApiError (so withErrorHandling can categorize
// 401/429/5xx). Move to BaseHttpClient only if it grows a form-body mode.
function sign(apiKey: string, apiSalt: string, jsonBody: string): string {
  return createHmac("sha256", apiSalt).update(apiKey + jsonBody + apiSalt).digest("hex");
}

export async function mangoPost(path: string, body: Record<string, unknown> = {}): Promise<unknown> {
  const apiKey = process.env.MANGO_API_KEY;
  const apiSalt = process.env.MANGO_API_SALT;
  if (!apiKey || !apiSalt) throw new Error("MANGO_API_KEY и MANGO_API_SALT не заданы");

  const jsonBody = JSON.stringify(body);
  const signature = sign(apiKey, apiSalt, jsonBody);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);

    const formData = new URLSearchParams();
    formData.set("vpbx_api_key", apiKey);
    formData.set("sign", signature);
    formData.set("json", jsonBody);

    try {
      const response = await fetch(`${BASE_URL}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        return await response.json();
      }

      if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 8000);
        logger.warn("Retrying after error status", { status: response.status, delay, attempt, maxRetries: MAX_RETRIES });
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      throw new ApiError(
        response.status,
        `Mango Office HTTP ${response.status}: ${response.statusText}`,
      );
    } catch (error) {
      clearTimeout(timer);
      if (error instanceof DOMException && error.name === "AbortError" && attempt < MAX_RETRIES) {
        logger.warn("Timeout, retrying", { attempt, maxRetries: MAX_RETRIES });
        continue;
      }
      throw error;
    }
  }
  throw new Error("Mango Office API: все попытки исчерпаны");
}
