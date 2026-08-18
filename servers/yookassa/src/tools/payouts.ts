import { z } from "zod";
import { getPayoutClient, formatAmount, moneyAmount, currencyCode } from "../client.js";

export const createPayoutSchema = z.object({
  amount: moneyAmount.describe("Payout amount"),
  currency: currencyCode.describe("Currency (ISO-4217, default RUB)"),
  payout_token: z.string().optional().describe("Recipient token from the payout widget (preferred; required if you lack PCI DSS to accept a raw card number)"),
  destination_type: z.enum(["bank_card", "yoo_money", "sbp"]).optional().describe("Recipient type (if not using payout_token). bank_card requires a PCI DSS certificate"),
  destination_value: z.string().optional().describe("Recipient: card number (bank_card), wallet number (yoo_money), or phone 79XXXXXXXXX (sbp)"),
  bank_id: z.string().optional().describe("SBP participant bank id (required for destination_type=sbp)"),
  description: z.string().max(128).optional().describe("Payout description"),
  metadata: z.record(z.string()).optional().describe("Arbitrary metadata"),
});

export const getPayoutSchema = z.object({
  payout_id: z.string().describe("Payout ID"),
});

export async function handleCreatePayout(params: z.infer<typeof createPayoutSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    amount: formatAmount(params.amount, params.currency),
  };

  if (params.payout_token && (params.destination_type || params.destination_value)) {
    throw new Error(
      "Provide either payout_token or destination_type/destination_value, not both — they are mutually exclusive."
    );
  }

  if (params.payout_token) {
    // Tokenized destination from the payout widget (no PCI DSS needed).
    body.payout_token = params.payout_token;
  } else {
    if (!params.destination_type || !params.destination_value) {
      throw new Error(
        "Provide either payout_token (from the payout widget) or destination_type + destination_value. " +
        "Accepting a raw card number (bank_card) requires a PCI DSS certificate."
      );
    }
    const destination: Record<string, unknown> = { type: params.destination_type };
    if (params.destination_type === "bank_card") {
      // YooKassa expects card as a nested object { number }, NOT a JSON string.
      destination.card = { number: params.destination_value };
    } else if (params.destination_type === "yoo_money") {
      destination.account_number = params.destination_value;
    } else if (params.destination_type === "sbp") {
      if (!params.bank_id) {
        throw new Error(
          "An SBP payout requires bank_id (the SBP participant bank id) in addition to the phone in destination_value."
        );
      }
      destination.phone = params.destination_value;
      destination.bank_id = params.bank_id;
    }
    body.payout_destination_data = destination;
  }

  if (params.description) body.description = params.description;
  if (params.metadata) body.metadata = params.metadata;

  const result = await getPayoutClient().post("/payouts", body);
  return JSON.stringify(result, null, 2);
}

export async function handleGetPayout(params: z.infer<typeof getPayoutSchema>): Promise<string> {
  const result = await getPayoutClient().get(`/payouts/${params.payout_id}`);
  return JSON.stringify(result, null, 2);
}
