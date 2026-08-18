/**
 * İletiMerkezi status-code maps and error guidance.
 *
 * The API echoes a status object on every response — `response.status.code` —
 * mirroring the HTTP status. These maps turn the raw numeric codes into
 * human-readable text so both the LLM and the end user get actionable errors.
 */

const DOCS = {
  errorCodes: "https://www.iletimerkezi.com/docs/api/error-codes",
  auth: "https://www.iletimerkezi.com/docs/api/authentication",
} as const;

/** Top-level API/HTTP status codes. */
export const API_STATUS_MESSAGES: Record<number, string> = {
  200: "Success",
  401: "Authentication failed — check API key/hash and that API access is enabled",
  402: "Insufficient account balance",
  403: "Operation not permitted",
  404: "Resource not found",
  450: "Sender header (başlık) is not approved",
  451: "Sender header is missing or invalid",
  452: "One or more recipient numbers are invalid",
  453: "Message is too long / invalid",
  454: "Message text is empty",
  455: "Recipient list is empty",
  456: "Scheduled send date/time is invalid",
  457: "Request validation failed",
};

/** Per-order lifecycle status (`response.order.status`). */
export const ORDER_STATUS: Record<number, string> = {
  113: "SENDING",
  114: "COMPLETED",
  115: "CANCELED",
};

/** Per-recipient delivery status (`response.order.message[].status`). */
export const MESSAGE_STATUS: Record<number, string> = {
  110: "WAITING",
  111: "DELIVERED",
  112: "UNDELIVERED",
};

/** Coerce a status field (string or number) into a number, or null. */
function toCode(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

/** Pull `response.status.code` out of a parsed body, as a number when possible. */
export function extractApiStatusCode(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const response = (body as Record<string, unknown>).response;
  if (!response || typeof response !== "object") return null;
  const status = (response as Record<string, unknown>).status;
  if (!status || typeof status !== "object") return null;
  return toCode((status as Record<string, unknown>).code);
}

/** Pull `response.status.message`, if any. */
export function extractApiStatusMessage(body: unknown): string {
  if (!body || typeof body !== "object") return "";
  const response = (body as Record<string, unknown>).response;
  if (!response || typeof response !== "object") return "";
  const status = (response as Record<string, unknown>).status;
  if (!status || typeof status !== "object") return "";
  const message = (status as Record<string, unknown>).message;
  return typeof message === "string" ? message : "";
}

/** A call succeeded when HTTP is 2xx and the API code is 200 (or absent). */
export function isOk(httpStatus: number, apiCode: number | null): boolean {
  return httpStatus >= 200 && httpStatus < 300 && (apiCode === null || apiCode === 200);
}

/** Build actionable guidance text for a failed call. */
export function guidanceFor(code: number | null, docUrl?: string): string {
  if (code === 401) {
    return [
      "Authentication failed (401). Verify:",
      "  1. ILETIMERKEZI_API_KEY and ILETIMERKEZI_API_HASH are set correctly (copied as-is from the panel — the hash is precomputed, never hash it yourself).",
      '  2. In panel.iletimerkezi.com → Settings → Security, "Allow API access" is ON.',
      "  3. If an IP allowlist is enabled, the request originates from a whitelisted IP.",
      `Auth reference: ${DOCS.auth}`,
    ].join("\n");
  }
  const known = code !== null ? API_STATUS_MESSAGES[code] : undefined;
  const lines: string[] = [];
  if (code !== null) {
    lines.push(`API status code ${code}${known ? `: ${known}` : ""}.`);
  }
  if (docUrl) lines.push(`Endpoint reference: ${docUrl}`);
  lines.push(`Error codes: ${DOCS.errorCodes}`);
  return lines.join("\n");
}
