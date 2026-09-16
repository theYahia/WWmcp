import { z } from "zod";
import { getClient } from "../client.js";
import { ENDPOINTS, TXN_TYPE } from "../config.js";
import { amountRupees, pkMobile, cnic6, txnRef, billReference, toPaisa, generateTxnRef } from "../validation.js";
import type { JazzCashResponse } from "../types.js";

// "Mobile Account" is the CNIC-enabled variant of the same MWALLET transaction type
// (JazzCash has no separate "MA" transaction type — Mobile Account == MWALLET).
export const createMobileAccountPaymentSchema = z.object({
  amount: amountRupees.describe("Payment amount in PKR rupees (converted to paisa automatically)"),
  mobile_number: pkMobile.describe("Mobile account number (03XXXXXXXXX)"),
  cnic: cnic6.describe("Last 6 digits of the customer's CNIC"),
  description: z.string().trim().min(1).max(100).optional().describe("Payment description"),
  txn_ref: txnRef.describe("Unique transaction reference (auto-generated if omitted)"),
  bill_reference: billReference.describe("Merchant bill reference for reconciliation (defaults to txn_ref)"),
});

export async function handleCreateMobileAccountPayment(
  params: z.infer<typeof createMobileAccountPaymentSchema>
): Promise<JazzCashResponse> {
  const client = getClient();
  const ref = params.txn_ref ?? generateTxnRef(client.getFormattedDateTime());
  const fields: Record<string, string> = {
    ...client.buildBaseFields({ expiry: true }),
    pp_Amount: toPaisa(params.amount),
    pp_BillReference: params.bill_reference ?? ref,
    pp_CNIC: params.cnic,
    pp_MobileNumber: params.mobile_number,
    pp_TxnRefNo: ref,
    pp_TxnType: TXN_TYPE.WALLET,
  };
  if (params.description) fields.pp_Description = params.description;
  return client.submit(ENDPOINTS.PAYMENT, fields);
}
