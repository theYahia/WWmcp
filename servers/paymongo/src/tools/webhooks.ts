import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getClient } from "../client.js";
import type { ToolDescriptor } from "../lib/tool.js";

const EVENTS_HINT =
  "Webhook event types to listen for. Common PayMongo events: source.chargeable, payment.paid, payment.failed, payment.refunded, link.payment.paid, checkout_session.payment.paid. See PayMongo docs for the full list.";

// --- create_webhook -------------------------------------------------------
export const createWebhookSchema = z.object({
  url: z.string().url().describe("HTTPS endpoint that will receive webhook events."),
  events: z.array(z.string()).min(1).describe(EVENTS_HINT),
});

export async function handleCreateWebhook(
  params: z.infer<typeof createWebhookSchema>,
): Promise<string> {
  const body = { data: { attributes: { url: params.url, events: params.events } } };
  const result = await getClient().request("POST", "/webhooks", body);
  return JSON.stringify(result, null, 2);
}

// --- list_webhooks --------------------------------------------------------
export const listWebhooksSchema = z.object({});

export async function handleListWebhooks(
  _params: z.infer<typeof listWebhooksSchema>,
): Promise<string> {
  const result = await getClient().request("GET", "/webhooks");
  return JSON.stringify(result, null, 2);
}

// --- get_webhook ----------------------------------------------------------
export const getWebhookSchema = z.object({
  webhook_id: z.string().describe("Webhook ID (hook_...)."),
});

export async function handleGetWebhook(
  params: z.infer<typeof getWebhookSchema>,
): Promise<string> {
  const result = await getClient().request(
    "GET",
    "/webhooks/" + encodeURIComponent(params.webhook_id),
  );
  return JSON.stringify(result, null, 2);
}

// --- update_webhook (url/events + enable/disable) -------------------------
export const updateWebhookSchema = z.object({
  webhook_id: z.string().describe("Webhook ID (hook_...)."),
  url: z.string().url().optional().describe("New endpoint URL."),
  events: z.array(z.string()).optional().describe("Replacement event list."),
  enabled: z
    .boolean()
    .optional()
    .describe("Enable (true) or disable (false) the webhook."),
});

export async function handleUpdateWebhook(
  params: z.infer<typeof updateWebhookSchema>,
): Promise<string> {
  const client = getClient();
  const out: Record<string, unknown> = {};

  const attrs: Record<string, unknown> = {};
  if (params.url !== undefined) attrs.url = params.url;
  if (params.events !== undefined) attrs.events = params.events;
  if (Object.keys(attrs).length > 0) {
    out.updated = await client.request(
      "POST",
      "/webhooks/" + encodeURIComponent(params.webhook_id),
      { data: { attributes: attrs } },
    );
  }

  if (params.enabled !== undefined) {
    const action = params.enabled ? "enable" : "disable";
    out.toggled = await client.request(
      "POST",
      `/webhooks/${encodeURIComponent(params.webhook_id)}/${action}`,
    );
  }

  if (Object.keys(out).length === 0) {
    throw new Error("Nothing to update: provide url, events, and/or enabled.");
  }
  return JSON.stringify(out, null, 2);
}

// --- verify_webhook_signature (LOCAL — no API call, no key needed) --------
export const verifyWebhookSignatureSchema = z.object({
  payload: z
    .string()
    .describe("The raw webhook request body, exactly as received (no re-serialization)."),
  signature_header: z
    .string()
    .describe("Value of the 'Paymongo-Signature' header (format: t=...,te=...,li=...)."),
  webhook_signing_secret: z
    .string()
    .describe(
      "The per-webhook signing secret (whsk_...) returned when the webhook was created. NOT your API secret key.",
    ),
  mode: z
    .enum(["test", "live"])
    .default("test")
    .describe("Which signature to verify: test (te) or live (li)."),
  tolerance_seconds: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("If set, reject signatures whose timestamp is older than this many seconds (replay protection)."),
});

export async function handleVerifyWebhookSignature(
  params: z.infer<typeof verifyWebhookSignatureSchema>,
): Promise<string> {
  const parts: Record<string, string> = Object.fromEntries(
    params.signature_header.split(",").map((kv): [string, string] => {
      const idx = kv.indexOf("=");
      return idx === -1
        ? [kv.trim(), ""]
        : [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    }),
  );

  const timestamp = parts.t;
  const wantKey = params.mode === "live" ? "li" : "te";
  const expected = parts[wantKey];

  if (!timestamp || !expected) {
    return JSON.stringify(
      { valid: false, reason: `Malformed signature header (missing t or ${wantKey}).` },
      null,
      2,
    );
  }

  // PayMongo signs `<timestamp>.<raw_body>` with the per-webhook secret.
  const signedPayload = `${timestamp}.${params.payload}`;
  const computed = createHmac("sha256", params.webhook_signing_secret)
    .update(signedPayload)
    .digest("hex");

  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(expected, "utf8");
  const signatureValid = a.length === b.length && timingSafeEqual(a, b);

  let withinTolerance = true;
  if (params.tolerance_seconds !== undefined) {
    const tsNum = Number(timestamp);
    const nowSec = Math.floor(Date.now() / 1000);
    withinTolerance = !Number.isNaN(tsNum) && nowSec - tsNum <= params.tolerance_seconds;
  }

  const valid = signatureValid && withinTolerance;
  return JSON.stringify(
    {
      valid,
      signature_valid: signatureValid,
      within_tolerance: withinTolerance,
      mode: params.mode,
      ...(valid
        ? {}
        : {
            reason: !signatureValid
              ? "Signature mismatch."
              : "Timestamp outside tolerance window.",
          }),
    },
    null,
    2,
  );
}

export const webhooksDescriptors: ToolDescriptor[] = [
  {
    name: "create_webhook",
    title: "Create Webhook",
    description:
      "Register a webhook endpoint for event delivery. The response includes the per-webhook signing secret (store it to verify signatures).",
    inputSchema: createWebhookSchema.shape,
    annotations: { openWorldHint: true },
    handler: handleCreateWebhook,
  },
  {
    name: "list_webhooks",
    title: "List Webhooks",
    description: "List all registered webhooks.",
    inputSchema: listWebhooksSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleListWebhooks,
  },
  {
    name: "get_webhook",
    title: "Get Webhook",
    description: "Retrieve a webhook by its ID.",
    inputSchema: getWebhookSchema.shape,
    annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
    handler: handleGetWebhook,
  },
  {
    name: "update_webhook",
    title: "Update Webhook",
    description:
      "Update a webhook's URL/events and/or enable/disable it. Provide any combination of url, events, enabled.",
    inputSchema: updateWebhookSchema.shape,
    annotations: { openWorldHint: true },
    handler: handleUpdateWebhook,
  },
  {
    name: "verify_webhook_signature",
    title: "Verify Webhook Signature",
    description:
      "Locally verify a PayMongo webhook's 'Paymongo-Signature' header (HMAC-SHA256 over `timestamp.body`). No network call — uses the per-webhook signing secret you pass in.",
    inputSchema: verifyWebhookSignatureSchema.shape,
    annotations: { readOnlyHint: true, openWorldHint: false },
    handler: handleVerifyWebhookSignature,
  },
];
