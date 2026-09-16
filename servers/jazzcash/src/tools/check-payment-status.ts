import { z } from "zod";
import { getClient } from "../client.js";
import { ENDPOINTS } from "../config.js";
import type { JazzCashResponse } from "../types.js";

// Status inquiry via the canonical PaymentInquiry/Inquire endpoint
// (absorbs the former duplicate `inquire_transaction` tool).
export const checkPaymentStatusSchema = z.object({
  txn_ref: z.string().trim().min(1).max(32).describe("Transaction reference number to inquire about"),
});

export async function handleCheckPaymentStatus(
  params: z.infer<typeof checkPaymentStatusSchema>
): Promise<JazzCashResponse> {
  const client = getClient();
  const fields: Record<string, string> = {
    ...client.buildBaseFields({ dateTime: false, currency: false, language: false }),
    pp_TxnRefNo: params.txn_ref,
  };
  return client.submit(ENDPOINTS.INQUIRY, fields);
}
