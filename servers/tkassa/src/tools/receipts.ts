import { z } from "zod";
import { TKassaClient, toKopecks } from "../client.js";

let _client: TKassaClient | null = null;
function getClient(): TKassaClient {
  if (!_client) _client = new TKassaClient();
  return _client;
}

const receiptItemSchema = z.object({
  Name: z.string().max(128).describe("Название товара/услуги"),
  Price: z.number().positive().describe("Цена за единицу в рублях"),
  Quantity: z.number().positive().describe("Количество"),
  Amount: z.number().positive().describe("Сумма позиции в рублях (Price × Quantity)"),
  Tax: z.enum(["none", "vat0", "vat10", "vat20", "vat110", "vat120"])
    .describe("Ставка НДС"),
  PaymentMethod: z.enum([
    "full_prepayment", "prepayment", "advance", "full_payment",
    "partial_payment", "credit", "credit_payment",
  ]).default("full_payment").optional(),
  PaymentObject: z.enum([
    "commodity", "excise", "job", "service", "gambling_bet",
    "gambling_prize", "lottery", "lottery_prize", "intellectual_activity",
    "payment", "agent_commission", "composite", "another",
  ]).default("commodity").optional(),
});

export const sendClosingReceiptSchema = z.object({
  payment_id: z.string().describe("ID платежа для закрывающего чека"),
  email: z.string().email().optional().describe("Email для отправки чека"),
  phone: z.string().optional().describe("Телефон для отправки чека"),
  taxation: z.enum(["osn", "usn_income", "usn_income_outcome", "envd", "esn", "patent"])
    .describe("Система налогообложения"),
  items: z.array(receiptItemSchema).min(1)
    .describe("Позиции чека"),
});

export async function handleSendClosingReceipt(
  params: z.infer<typeof sendClosingReceiptSchema>
): Promise<string> {
  const receipt: Record<string, unknown> = {
    Taxation: params.taxation,
    Items: params.items.map(item => ({
      ...item,
      Price: toKopecks(item.Price),
      Amount: toKopecks(item.Amount),
    })),
  };
  if (params.email) receipt.Email = params.email;
  if (params.phone) receipt.Phone = params.phone;

  return JSON.stringify(
    await getClient().post("/SendClosingReceipt", { PaymentId: params.payment_id, Receipt: receipt }),
    null, 2
  );
}
