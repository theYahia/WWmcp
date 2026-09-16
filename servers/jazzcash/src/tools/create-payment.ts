import { z } from "zod";
import { getClient } from "../client.js";
import { ENDPOINTS, TXN_TYPE } from "../config.js";
import { amountRupees, pkMobile, txnRef, billReference, toPaisa, generateTxnRef } from "../validation.js";
import type { JazzCashResponse } from "../types.js";

export const createPaymentSchema = z.object({
  amount: amountRupees.describe("Payment amount in PKR rupees (converted to paisa automatically)"),
  mobile_number: pkMobile.describe("Customer mobile wallet number (03XXXXXXXXX)"),
  description: z.string().trim().min(1).max(100).describe("Payment description"),
  txn_ref: txnRef.describe("Unique transaction reference (auto-generated if omitted)"),
  bill_reference: billReference.describe("Merchant bill reference for reconciliation (defaults to txn_ref)"),
});

export async function handleCreatePayment(
  params: z.infer<typeof createPaymentSchema>
): Promise<JazzCashResponse> {
  const client = getClient();
  const ref = params.txn_ref ?? generateTxnRef(client.getFormattedDateTime());
  const fields: Record<string, string> = {
    ...client.buildBaseFields({ expiry: true }),
    pp_Amount: toPaisa(params.amount),
    pp_BillReference: params.bill_reference ?? ref,
    pp_Description: params.description,
    pp_MobileNumber: params.mobile_number,
    pp_TxnRefNo: ref,
    pp_TxnType: TXN_TYPE.WALLET,
  };
  return client.submit(ENDPOINTS.PAYMENT, fields);
}
