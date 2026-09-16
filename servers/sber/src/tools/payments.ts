import { z } from "zod";
import { sberFetch } from "../client.js";

// --- create_payment ---
export const createPaymentSchema = z.object({
  payer_account: z.string().describe("Счёт плательщика"),
  payee_account: z.string().describe("Счёт получателя"),
  payee_name: z.string().describe("Наименование получателя"),
  payee_bank_bic: z.string().describe("БИК банка получателя"),
  amount: z.number().positive().describe("Сумма платежа"),
  currency: z.string().default("RUB").describe("Валюта (по умолчанию RUB)"),
  purpose: z.string().describe("Назначение платежа"),
});

export async function handleCreatePayment(
  params: z.infer<typeof createPaymentSchema>,
): Promise<string> {
  const result = await sberFetch("/fintech/v1/payments", {
    method: "POST",
    body: {
      payerAccount: params.payer_account,
      payeeAccount: params.payee_account,
      payeeName: params.payee_name,
      payeeBankBic: params.payee_bank_bic,
      amount: params.amount,
      currency: params.currency,
      purpose: params.purpose,
    },
  });
  return JSON.stringify(result, null, 2);
}

// --- get_payment_status ---
export const getPaymentStatusSchema = z.object({
  payment_id: z.string().describe("ID платежа"),
});

export async function handleGetPaymentStatus(
  params: z.infer<typeof getPaymentStatusSchema>,
): Promise<string> {
  const result = await sberFetch(`/fintech/v1/payments/${params.payment_id}`);
  return JSON.stringify(result, null, 2);
}
