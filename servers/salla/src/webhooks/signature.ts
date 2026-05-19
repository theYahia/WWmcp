/**
 * Salla webhook signature verification.
 *
 * Salla supports two security strategies for webhooks:
 *
 *   1. "Signature" (default): HMAC-SHA256(secret, raw_body) → hex digest in
 *      the `X-Salla-Signature` header. Strategy advertised via the
 *      `X-Salla-Security-Strategy: Signature` header.
 *
 *   2. "Token": the merchant's webhook secret is passed verbatim in the
 *      `Authorization` header. Strategy advertised via
 *      `X-Salla-Security-Strategy: Token`.
 *
 * Sources verified 2026-05-19:
 *   - docs.salla.dev/doc-421119 (Webhooks Explained → Security Strategies)
 *   - github.com/SallaApp/webhook-actions-js (official Node listener)
 *
 * This module ships small, dependency-free primitives that an MCP host can
 * call when forwarding webhook payloads to the LLM. Timing-safe comparison
 * is used to avoid leaking the secret via response timing.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export type SallaSecurityStrategy = "Signature" | "Token";

export interface VerifyResult {
  /** True when the payload is authentic and untampered. */
  valid: boolean;
  /** Which Salla strategy was used to verify the request. */
  strategy: SallaSecurityStrategy;
  /** Hex digest computed locally — useful for debugging mismatches. */
  computed?: string;
}

/**
 * Compute the canonical Salla webhook signature for a payload.
 *
 * The payload MUST be the raw request body as a string (what Salla actually
 * signed). Passing `JSON.stringify(req.body)` after Express has reparsed the
 * body is acceptable for Salla because the publisher and consumer agree on
 * canonical JSON formatting, but for maximum correctness retain the raw body
 * in your HTTP framework (`express.raw()` or equivalent).
 *
 * @param payload Raw request body as a UTF-8 string.
 * @param secret  Webhook secret from the Salla Partners Portal (`SALLA_WEBHOOK_SECRET`).
 * @returns Lowercase hex digest of `HMAC-SHA256(secret, payload)`.
 */
export function computeSignature(payload: string, secret: string): string {
  if (typeof payload !== "string") {
    throw new TypeError("payload must be a string (raw request body)");
  }
  if (!secret) {
    throw new Error("secret is required");
  }
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

/**
 * Verify a Salla webhook signature using the "Signature" strategy.
 *
 * Uses Node's `crypto.timingSafeEqual` to compare digests, which guarantees
 * the comparison takes the same number of CPU cycles regardless of which
 * byte differs first — preventing a remote attacker from learning the secret
 * one byte at a time via response timing.
 *
 * @returns `{ valid: true, strategy: "Signature" }` if and only if the
 *   provided signature equals `HMAC-SHA256(secret, payload)` in hex.
 */
export function verifySignature(
  payload: string,
  signature: string | undefined | null,
  secret: string,
): VerifyResult {
  if (!signature) {
    throw new Error(
      "Missing X-Salla-Signature header. Reject the request and log the sender IP.",
    );
  }
  if (!secret) {
    throw new Error(
      "SALLA_WEBHOOK_SECRET is required to verify webhook signatures. Get it from Salla Partners → Apps → Webhooks.",
    );
  }

  const computed = computeSignature(payload, secret);

  // Both buffers MUST be the same length for timingSafeEqual, so we
  // length-check first (constant-time check against a known length is fine).
  const sigBuf = Buffer.from(signature, "utf8");
  const computedBuf = Buffer.from(computed, "utf8");

  if (sigBuf.length !== computedBuf.length) {
    return { valid: false, strategy: "Signature", computed };
  }

  return {
    valid: timingSafeEqual(sigBuf, computedBuf),
    strategy: "Signature",
    computed,
  };
}

/**
 * Verify a Salla webhook using the "Token" strategy: compare the Authorization
 * header to the configured secret, timing-safely.
 *
 * This strategy is simpler but exposes the secret to anyone who can read the
 * raw request (no per-request rotation). Prefer the Signature strategy.
 */
export function verifyToken(
  authorization: string | undefined | null,
  secret: string,
): VerifyResult {
  if (!authorization) {
    throw new Error("Missing Authorization header for Token strategy.");
  }
  if (!secret) {
    throw new Error("SALLA_WEBHOOK_SECRET is required.");
  }

  const authBuf = Buffer.from(authorization, "utf8");
  const secretBuf = Buffer.from(secret, "utf8");

  if (authBuf.length !== secretBuf.length) {
    return { valid: false, strategy: "Token" };
  }

  return {
    valid: timingSafeEqual(authBuf, secretBuf),
    strategy: "Token",
  };
}

/**
 * Auto-dispatch verifier — reads the `X-Salla-Security-Strategy` header (or
 * falls back to `Signature`, which is Salla's default) and runs the right
 * verification.
 *
 * Pass the full request headers as a plain object or `Headers` instance. The
 * function is header-name case-insensitive.
 */
export function verifyWebhook(
  payload: string,
  headers: Record<string, string | undefined> | Headers,
  secret: string,
): VerifyResult {
  const getHeader = (name: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) ?? undefined;
    }
    const lower = name.toLowerCase();
    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() === lower) return v ?? undefined;
    }
    return undefined;
  };

  const strategy = (getHeader("X-Salla-Security-Strategy") ?? "Signature") as
    | SallaSecurityStrategy
    | string;

  if (strategy === "Token") {
    return verifyToken(getHeader("Authorization"), secret);
  }
  return verifySignature(payload, getHeader("X-Salla-Signature"), secret);
}
