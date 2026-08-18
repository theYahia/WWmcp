import { z } from "zod";
import { TKassaClient, toKopecks } from "../client.js";

let _client: TKassaClient | null = null;
function getClient(): TKassaClient {
  if (!_client) _client = new TKassaClient();
  return _client;
}

// --- Schemas ---

export const initPaymentSchema = z.object({
  amount: z.number().positive().describe("Payment amount in rubles (e.g. 100.50)"),
  order_id: z.string().describe("Unique order ID in your system"),
  description: z.string().max(250).optional().describe("Payment description (max 250 chars)"),
  customer_key: z.string().optional().describe("Customer ID in your system"),
  recurrent: z.enum(["Y"]).optional().describe("Recurrent payment flag (Y)"),
  language: z.enum(["ru", "en"]).default("ru").describe("Payment form language"),
  notification_url: z.string().url().optional().describe("Notification URL"),
  success_url: z.string().url().optional().describe("Success redirect URL"),
  fail_url: z.string().url().optional().describe("Failure redirect URL"),
});

export const getStateSchema = z.object({
  payment_id: z.string().describe("Payment ID in T-Kassa system"),
});

export const confirmSchema = z.object({
  payment_id: z.string().describe("Payment ID to confirm (two-stage)"),
  amount: z.number().positive().optional().describe("Confirm amount in rubles (for partial confirm)"),
});

export const cancelSchema = z.object({
  payment_id: z.string().describe("Payment ID to cancel"),
  amount: z.number().positive().optional().describe("Cancel amount in rubles (for partial cancel)"),
});

export const chargeSchema = z.object({
  payment_id: z.string().describe("PaymentId исходного платежа с Recurrent=Y"),
  rebill_id: z.string().describe("RebillId карты (из уведомления или get_card_list)"),
  amount: z.number().positive().optional()
    .describe("Сумма в рублях (по умолчанию = исходная сумма)"),
});

// --- Handlers ---

export async function handleInitPayment(params: z.infer<typeof initPaymentSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    Amount: toKopecks(params.amount),
    OrderId: params.order_id,
    Language: params.language,
  };

  if (params.description) body.Description = params.description;
  if (params.customer_key) body.CustomerKey = params.customer_key;
  if (params.recurrent) body.Recurrent = params.recurrent;
  if (params.notification_url) body.NotificationURL = params.notification_url;
  if (params.success_url) body.SuccessURL = params.success_url;
  if (params.fail_url) body.FailURL = params.fail_url;

  const result = await getClient().post("/Init", body);
  return JSON.stringify(result, null, 2);
}

export async function handleGetState(params: z.infer<typeof getStateSchema>): Promise<string> {
  const result = await getClient().post("/GetState", { PaymentId: params.payment_id });
  return JSON.stringify(result, null, 2);
}

export async function handleConfirm(params: z.infer<typeof confirmSchema>): Promise<string> {
  const body: Record<string, unknown> = { PaymentId: params.payment_id };
  if (params.amount) body.Amount = toKopecks(params.amount);

  const result = await getClient().post("/Confirm", body);
  return JSON.stringify(result, null, 2);
}

export async function handleCancel(params: z.infer<typeof cancelSchema>): Promise<string> {
  const body: Record<string, unknown> = { PaymentId: params.payment_id };
  if (params.amount) body.Amount = toKopecks(params.amount);

  const result = await getClient().post("/Cancel", body);
  return JSON.stringify(result, null, 2);
}

export async function handleCharge(params: z.infer<typeof chargeSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    PaymentId: params.payment_id,
    RebillId: params.rebill_id,
  };
  if (params.amount) body.Amount = toKopecks(params.amount);
  return JSON.stringify(await getClient().post("/Charge", body), null, 2);
}
