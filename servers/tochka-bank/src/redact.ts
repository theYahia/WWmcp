// Redaction for anything that might reach logs, error messages, or the LLM.
// Banking error bodies can echo INNs, account numbers, balances, and even the
// submitted credentials, so every string that leaves the client is masked here.

function maskTail(value: string, keep = 4): string {
  if (value.length <= keep) return "*".repeat(value.length);
  return "*".repeat(value.length - keep) + value.slice(-keep);
}

function stringify(input: unknown): string {
  if (typeof input === "string") return input;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

/**
 * Mask secrets and PII in arbitrary text/objects:
 * bearer tokens, client_secret values, JWTs, 20-digit accounts, 10/12-digit
 * INNs, and 9-digit BIKs (each keeps only the last 4 characters).
 */
export function redact(input: unknown): string {
  let s = stringify(input);

  // Bearer tokens.
  s = s.replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer ***");
  // client_secret / refresh_token / access_token values in key=value or "key":"value" form.
  s = s.replace(
    /(client_secret|refresh_token|access_token|client_id)(["']?\s*[:=]\s*["']?)[^"'&\s,}]+/gi,
    "$1$2***",
  );
  // Standalone JWTs (header.payload.signature).
  s = s.replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "***jwt***");
  // 20-digit account numbers (mask before shorter digit runs).
  s = s.replace(/\b\d{20}\b/g, (m) => maskTail(m));
  // 12-digit INN.
  s = s.replace(/\b\d{12}\b/g, (m) => maskTail(m));
  // 10-digit INN.
  s = s.replace(/\b\d{10}\b/g, (m) => maskTail(m));
  // 9-digit BIK.
  s = s.replace(/\b\d{9}\b/g, (m) => maskTail(m));

  return s;
}
