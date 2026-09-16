import { z } from "zod";
import { getClient } from "../client.js";
import { ENDPOINTS, TXN_TYPE } from "../config.js";
import { amountRupees, pkMobile, cnic6, txnRef, billReference, toPaisa, generateTxnRef } from "../validation.js";
import type { JazzCashResponse } from "../types.js";

// JazzCash has no dedicated "CreateVoucher" endpoint. An Over-The-Counter (OTC) voucher is
// created via the standard payment call with pp_TxnType=OTC; the gateway returns a voucher
// number that the customer redeems offline at a JazzCash outlet (there is no redeem API).
export const createVoucherSchema = z.object({
  amount: amountRupees.describe("Voucher amount in PKR rupees (converted to paisa automatically)"),
  mobile_number: pkMobile.describe("Customer mobile number (03XXXXXXXXX)"),
  cnic: cnic6.describe("Last 6 digits of the customer's CNIC"),
  description: z.string().trim().min(1).max(100).optional().describe("Voucher description"),
  txn_ref: txnRef.describe("Unique transaction reference (auto-generated if omitted)"),
  bill_reference: billReference.describe("Merchant bill reference for reconciliation (defaults to txn_ref)"),
});

export async function handleCreateVoucher(
  params: z.infer<typeof createVoucherSchema>
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
    pp_TxnType: TXN_TYPE.VOUCHER,
  };
  if (params.description) fields.pp_Description = params.description;
  return client.submit(ENDPOINTS.PAYMENT, fields);
}
