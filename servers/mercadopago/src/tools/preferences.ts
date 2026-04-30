import { z } from "zod";
import { mpGet, mpPost, mpPut } from "../client.js";

// ── create_preference (Checkout Pro / Bricks) ──

export const createPreferenceSchema = z.object({
  items: z
    .array(
      z.object({
        title: z.string().describe("Item title"),
        quantity: z.number().int().positive().describe("Quantity"),
        unit_price: z.number().positive().describe("Unit price in account currency"),
        currency_id: z.string().optional().describe("ISO currency code (defaults to account currency)"),
        description: z.string().optional().describe("Item description"),
      }),
    )
    .min(1)
    .describe("Items in the preference (cart)"),
  payer_email: z.string().email().optional().describe("Pre-fill payer email"),
  payer_name: z.string().optional().describe("Pre-fill payer name"),
  external_reference: z.string().optional().describe("Your internal order ID"),
  back_urls: z
    .object({
      success: z.string().url().optional(),
      failure: z.string().url().optional(),
      pending: z.string().url().optional(),
    })
    .optional()
    .describe("Redirect URLs after checkout completion"),
  notification_url: z.string().url().optional().describe("Webhook URL for IPN notifications"),
  auto_return: z.enum(["approved", "all"]).optional().describe("Auto-redirect setting"),
});

export async function handleCreatePreference(
  params: z.infer<typeof createPreferenceSchema>,
): Promise<string> {
  const body: Record<string, unknown> = { items: params.items };
  if (params.external_reference) body.external_reference = params.external_reference;
  if (params.back_urls) body.back_urls = params.back_urls;
  if (params.notification_url) body.notification_url = params.notification_url;
  if (params.auto_return) body.auto_return = params.auto_return;
  if (params.payer_email || params.payer_name) {
    body.payer = {
      ...(params.payer_email ? { email: params.payer_email } : {}),
      ...(params.payer_name ? { name: params.payer_name } : {}),
    };
  }
  const result = await mpPost("/checkout/preferences", body);
  return JSON.stringify(result, null, 2);
}

// ── get_preference ──

export const getPreferenceSchema = z.object({
  preference_id: z.string().describe("Preference ID"),
});

export async function handleGetPreference(
  params: z.infer<typeof getPreferenceSchema>,
): Promise<string> {
  const result = await mpGet(`/checkout/preferences/${params.preference_id}`);
  return JSON.stringify(result, null, 2);
}

// ── update_preference ──

export const updatePreferenceSchema = z.object({
  preference_id: z.string().describe("Preference ID to update"),
  patch: z.record(z.unknown()).describe("Fields to update (e.g. items, back_urls, expiration)"),
});

export async function handleUpdatePreference(
  params: z.infer<typeof updatePreferenceSchema>,
): Promise<string> {
  const result = await mpPut(`/checkout/preferences/${params.preference_id}`, params.patch);
  return JSON.stringify(result, null, 2);
}
