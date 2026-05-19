import { z } from "zod";
import { verifyWebhook, computeSignature } from "../webhooks/signature.js";

/**
 * Verify a Salla webhook signature. Exposed as an MCP tool so the host LLM
 * can ask the server to validate a payload before acting on it — useful when
 * an upstream agent has the raw webhook envelope and wants a single source
 * of truth for "is this really from Salla?".
 *
 * Returns a structured JSON result rather than throwing on tampered payloads,
 * so the LLM sees `valid: false` and can react (e.g. log + drop).
 *
 * The webhook secret comes from `SALLA_WEBHOOK_SECRET` (read at call time so
 * tests can stub it).
 */
export const verifyWebhookSignatureSchema = z.object({
  payload: z
    .string()
    .describe(
      "Raw request body as a UTF-8 string. Use the exact bytes Salla sent — do not re-stringify a parsed JSON object unless you know the framework preserved key order.",
    ),
  signature: z
    .string()
    .optional()
    .describe(
      "Value of the X-Salla-Signature header (hex). Required for the default 'Signature' strategy.",
    ),
  authorization: z
    .string()
    .optional()
    .describe(
      "Value of the Authorization header. Required for the 'Token' strategy.",
    ),
  strategy: z
    .enum(["Signature", "Token"])
    .default("Signature")
    .describe(
      "Salla security strategy, as advertised by the X-Salla-Security-Strategy header.",
    ),
  secret: z
    .string()
    .optional()
    .describe(
      "Override the SALLA_WEBHOOK_SECRET env var (e.g. for multi-tenant hosts).",
    ),
});

export async function handleVerifyWebhookSignature(
  params: z.infer<typeof verifyWebhookSignatureSchema>,
): Promise<string> {
  const secret = params.secret ?? process.env["SALLA_WEBHOOK_SECRET"];
  if (!secret) {
    throw new Error(
      "Webhook secret not configured. Set SALLA_WEBHOOK_SECRET or pass `secret` explicitly.",
    );
  }

  const headers: Record<string, string> = {
    "X-Salla-Security-Strategy": params.strategy,
  };
  if (params.signature) headers["X-Salla-Signature"] = params.signature;
  if (params.authorization) headers["Authorization"] = params.authorization;

  const result = verifyWebhook(params.payload, headers, secret);
  return JSON.stringify(
    {
      valid: result.valid,
      strategy: result.strategy,
      computed_signature:
        result.strategy === "Signature"
          ? result.computed
          : computeSignature(params.payload, secret),
    },
    null,
    2,
  );
}
