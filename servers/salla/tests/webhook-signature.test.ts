import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import {
  computeSignature,
  verifySignature,
  verifyToken,
  verifyWebhook,
} from "../src/webhooks/signature.js";
import { handleVerifyWebhookSignature } from "../src/tools/verify-webhook-signature.js";

const SECRET = "test_webhook_secret_super_long_random_value";
const PAYLOAD = JSON.stringify({
  event: "order.created",
  data: { id: 1001, total: { amount: 150, currency: "SAR" } },
});

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

describe("webhook signature primitives", () => {
  it("computeSignature matches a hand-rolled HMAC-SHA256 hex digest", () => {
    const expected = sign(PAYLOAD, SECRET);
    expect(computeSignature(PAYLOAD, SECRET)).toBe(expected);
    // sanity: hex form, 64 chars
    expect(expected).toMatch(/^[0-9a-f]{64}$/);
  });

  it("verifySignature returns valid=true for a correct signature", () => {
    const sig = sign(PAYLOAD, SECRET);
    const r = verifySignature(PAYLOAD, sig, SECRET);
    expect(r.valid).toBe(true);
    expect(r.strategy).toBe("Signature");
    expect(r.computed).toBe(sig);
  });

  it("verifySignature rejects a tampered payload", () => {
    const sig = sign(PAYLOAD, SECRET);
    const tampered = PAYLOAD.replace("1001", "9999");
    const r = verifySignature(tampered, sig, SECRET);
    expect(r.valid).toBe(false);
  });

  it("verifySignature rejects a signature signed with the wrong secret", () => {
    const wrongSig = sign(PAYLOAD, "different_secret");
    const r = verifySignature(PAYLOAD, wrongSig, SECRET);
    expect(r.valid).toBe(false);
  });

  it("verifySignature rejects truncated signatures (length mismatch)", () => {
    const sig = sign(PAYLOAD, SECRET).slice(0, 60); // 60 chars, not 64
    const r = verifySignature(PAYLOAD, sig, SECRET);
    expect(r.valid).toBe(false);
  });

  it("verifySignature throws on missing signature header", () => {
    expect(() => verifySignature(PAYLOAD, "", SECRET)).toThrow(
      /Missing X-Salla-Signature/,
    );
    expect(() => verifySignature(PAYLOAD, null, SECRET)).toThrow(
      /Missing X-Salla-Signature/,
    );
  });

  it("verifySignature throws on missing secret", () => {
    expect(() => verifySignature(PAYLOAD, "abc", "")).toThrow(
      /SALLA_WEBHOOK_SECRET/,
    );
  });

  it("verifyToken accepts the matching secret and rejects anything else", () => {
    expect(verifyToken(SECRET, SECRET).valid).toBe(true);
    expect(verifyToken("nope", SECRET).valid).toBe(false);
    expect(verifyToken(SECRET + "x", SECRET).valid).toBe(false);
  });

  it("verifyWebhook auto-dispatches via X-Salla-Security-Strategy header", () => {
    const sig = sign(PAYLOAD, SECRET);
    const sigResult = verifyWebhook(
      PAYLOAD,
      {
        "X-Salla-Security-Strategy": "Signature",
        "X-Salla-Signature": sig,
      },
      SECRET,
    );
    expect(sigResult.valid).toBe(true);
    expect(sigResult.strategy).toBe("Signature");

    const tokenResult = verifyWebhook(
      PAYLOAD,
      {
        "X-Salla-Security-Strategy": "Token",
        Authorization: SECRET,
      },
      SECRET,
    );
    expect(tokenResult.valid).toBe(true);
    expect(tokenResult.strategy).toBe("Token");
  });

  it("verifyWebhook is header-name case-insensitive", () => {
    const sig = sign(PAYLOAD, SECRET);
    const r = verifyWebhook(
      PAYLOAD,
      {
        "x-salla-security-strategy": "Signature",
        "x-salla-signature": sig,
      },
      SECRET,
    );
    expect(r.valid).toBe(true);
  });

  it("verifyWebhook defaults to Signature strategy when header is absent", () => {
    const sig = sign(PAYLOAD, SECRET);
    const r = verifyWebhook(
      PAYLOAD,
      { "X-Salla-Signature": sig },
      SECRET,
    );
    expect(r.valid).toBe(true);
    expect(r.strategy).toBe("Signature");
  });
});

describe("verify_webhook_signature MCP tool handler", () => {
  it("returns valid=true for a correctly signed payload (explicit secret)", async () => {
    const sig = sign(PAYLOAD, SECRET);
    const result = JSON.parse(
      await handleVerifyWebhookSignature({
        payload: PAYLOAD,
        signature: sig,
        strategy: "Signature",
        secret: SECRET,
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.strategy).toBe("Signature");
    expect(result.computed_signature).toBe(sig);
  });

  it("returns valid=false for a tampered payload", async () => {
    const sig = sign(PAYLOAD, SECRET);
    const result = JSON.parse(
      await handleVerifyWebhookSignature({
        payload: PAYLOAD + "\n",
        signature: sig,
        strategy: "Signature",
        secret: SECRET,
      }),
    );
    expect(result.valid).toBe(false);
  });

  it("throws when secret is not configured anywhere", async () => {
    const prev = process.env["SALLA_WEBHOOK_SECRET"];
    delete process.env["SALLA_WEBHOOK_SECRET"];
    try {
      await expect(
        handleVerifyWebhookSignature({
          payload: PAYLOAD,
          signature: "abc",
          strategy: "Signature",
        }),
      ).rejects.toThrow(/secret not configured/);
    } finally {
      if (prev !== undefined) process.env["SALLA_WEBHOOK_SECRET"] = prev;
    }
  });

  it("falls back to SALLA_WEBHOOK_SECRET env var when secret arg omitted", async () => {
    const prev = process.env["SALLA_WEBHOOK_SECRET"];
    process.env["SALLA_WEBHOOK_SECRET"] = SECRET;
    try {
      const sig = sign(PAYLOAD, SECRET);
      const result = JSON.parse(
        await handleVerifyWebhookSignature({
          payload: PAYLOAD,
          signature: sig,
          strategy: "Signature",
        }),
      );
      expect(result.valid).toBe(true);
    } finally {
      if (prev === undefined) delete process.env["SALLA_WEBHOOK_SECRET"];
      else process.env["SALLA_WEBHOOK_SECRET"] = prev;
    }
  });

  it("handles Token strategy via authorization arg", async () => {
    const result = JSON.parse(
      await handleVerifyWebhookSignature({
        payload: PAYLOAD,
        authorization: SECRET,
        strategy: "Token",
        secret: SECRET,
      }),
    );
    expect(result.valid).toBe(true);
    expect(result.strategy).toBe("Token");
  });
});
