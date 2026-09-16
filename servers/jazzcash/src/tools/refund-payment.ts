import { z } from "zod";
import { getClient } from "../client.js";
import { ENDPOINTS } from "../config.js";
import { amountRupees, toPaisa } from "../validation.js";
import type { JazzCashResponse } from "../types.js";

// NOTE: per the JazzCash v4.2 integration guide, refunds apply to CARD transactions,
// not wallet/OTC. Verify applicability for your transaction type before relying on this.
export const refundPaymentSchema = z.object({
  txn_ref: z.string().trim().min(1).max(32).describe("Original transaction reference to refund"),
  amount: amountRupees.describe("Refund amount in PKR rupees (converted to paisa automatically)"),
});

export async function handleRefundPayment(
  params: z.infer<typeof refundPaymentSchema>
): Promise<JazzCashResponse> {
  const client = getClient();
  const fields: Record<string, string> = {
    ...client.buildBaseFields({ language: false }),
    pp_Amount: toPaisa(params.amount),
    pp_TxnRefNo: params.txn_ref,
  };
  return client.submit(ENDPOINTS.REFUND, fields);
}
