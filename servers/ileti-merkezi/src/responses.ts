import { ORDER_STATUS, MESSAGE_STATUS } from "./errors.js";

/**
 * Best-effort, type-safe "highlights" extracted from a parsed response body.
 *
 * The full raw JSON is always surfaced to the caller separately; these helpers
 * add a short, readable summary for the well-known response shapes. When a body
 * does not match the expected shape, the helper returns null and only the raw
 * JSON is shown — so we never fabricate or hide data.
 */

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

/** Navigate `response.<...path>` safely. */
function nav(body: unknown, ...path: string[]): unknown {
  let cur = asRecord(body)?.response;
  for (const key of path) {
    cur = asRecord(cur)?.[key];
    if (cur === undefined) return undefined;
  }
  return cur;
}

function num(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function labelStatus(map: Record<number, string>, value: unknown): string {
  const code = num(value);
  if (code === undefined) return String(value ?? "");
  return map[code] ? `${map[code]} (${code})` : String(code);
}

export function summarizeSend(body: unknown): string | null {
  const id = nav(body, "order", "id");
  return id != null && id !== "" ? `Order ID: ${id}` : null;
}

export function summarizeCancel(body: unknown): string | null {
  const id = nav(body, "order", "id");
  return id != null && id !== "" ? `Canceled order ID: ${id}` : null;
}

export function summarizeBalance(body: unknown): string | null {
  const amount = num(nav(body, "balance", "amount"));
  const sms = num(nav(body, "balance", "sms"));
  if (amount === undefined && sms === undefined) return null;
  return `Balance: ${amount ?? "?"} TL · ${sms ?? "?"} SMS credits`;
}

export function summarizeSenders(body: unknown): string | null {
  const senders = nav(body, "senders", "sender");
  if (!Array.isArray(senders)) return null;
  const names = senders.map((s) => (typeof s === "string" ? s : JSON.stringify(s)));
  return `Approved sender headers (${names.length}): ${names.join(", ") || "—"}`;
}

export function summarizeReport(body: unknown): string | null {
  const order = asRecord(nav(body, "order"));
  if (!order) return null;
  const messages = Array.isArray(order.message) ? order.message : [];
  const lines = [
    `Order ${order.id ?? "?"} · status ${labelStatus(ORDER_STATUS, order.status)}`,
    `total ${order.total ?? "?"} · delivered ${order.delivered ?? "?"} · undelivered ${order.undelivered ?? "?"} · waiting ${order.waiting ?? "?"}`,
  ];
  if (messages.length) {
    const sample = messages
      .slice(0, 5)
      .map((m) => {
        const rec = asRecord(m);
        return rec ? `${rec.number}: ${labelStatus(MESSAGE_STATUS, rec.status)}` : "";
      })
      .filter(Boolean)
      .join(", ");
    lines.push(`messages[${messages.length}]: ${sample}${messages.length > 5 ? ", …" : ""}`);
  }
  return lines.join("\n");
}

export function summarizeBlacklist(body: unknown): string | null {
  const count = num(nav(body, "blacklist", "count"));
  const numbers = nav(body, "blacklist", "number");
  if (count === undefined && !Array.isArray(numbers)) return null;
  const n = Array.isArray(numbers) ? numbers.length : 0;
  return `Blacklist: ${count ?? n} total · ${n} on this page`;
}
