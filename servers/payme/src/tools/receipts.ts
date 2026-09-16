import { z } from "zod";
import type { JsonRpcClient } from "../client.js";

export const receiptTools = [
  {
    name: "receipts_create",
    description:
      "Create a payment receipt in Payme. Amount must be in TIYINS (1 sum = 100 tiyins, e.g. 100000 tiyins = 1000 sum). The receipt can then be paid via receipts_pay or sent as a link via receipts_send.",
    inputSchema: {
      // A money field on a create call: reject negatives, zero and fractional
      // tiyins at the boundary rather than forwarding them to Payme.
      amount: z.number().int().positive().describe("Amount in TIYINS (1 sum = 100 tiyins). Example: 100000 = 1000 sum"),
      account: z.record(z.string(), z.string()).describe("Account fields, e.g. {order_id: '123'}"),
    },
    method: "receipts.create",
    buildParams: (args: { amount: number; account: Record<string, string> }) => ({
      amount: args.amount,
      account: args.account,
    }),
  },
  {
    name: "receipts_pay",
    description:
      "Pay a receipt using a verified card token. The card must be verified first via cards_verify. Returns the payment result including transaction status and timestamps.",
    inputSchema: {
      id: z.string().describe("Receipt ID from receipts_create"),
      token: z.string().describe("Verified card token"),
    },
    method: "receipts.pay",
    buildParams: (args: { id: string; token: string }) => ({
      id: args.id,
      token: args.token,
    }),
  },
  {
    name: "receipts_send",
    description:
      "Send a payment link to a phone number via SMS. The recipient can open the link and complete the payment through Payme. Phone number must be in international format.",
    inputSchema: {
      id: z.string().describe("Receipt ID"),
      phone: z.string().describe("Phone number in international format, e.g. 998901234567"),
    },
    method: "receipts.send",
    buildParams: (args: { id: string; phone: string }) => ({
      id: args.id,
      phone: args.phone,
    }),
  },
  {
    name: "receipts_cancel",
    description:
      "Cancel a receipt in Payme. Requires a reason code. If the receipt was already paid, this will initiate a refund. The cancellation reason is recorded for audit purposes.",
    inputSchema: {
      id: z.string().describe("Receipt ID"),
      reason: z.number().describe("Cancellation reason code"),
    },
    method: "receipts.cancel",
    buildParams: (args: { id: string; reason: number }) => ({
      id: args.id,
      reason: args.reason,
    }),
  },
  {
    name: "receipts_check",
    description:
      "Check the current state of a receipt in Payme. Returns the receipt status, amount, creation time, payment time, and account details. Useful for tracking payment progress.",
    inputSchema: {
      id: z.string().describe("Receipt ID"),
    },
    method: "receipts.check",
    buildParams: (args: { id: string }) => ({
      id: args.id,
    }),
  },
  {
    name: "receipts_get_all",
    description:
      "Get all receipts within a time range from Payme. Returns paginated results with receipt details. Use offset and limit for pagination through large result sets.",
    inputSchema: {
      from: z.number().describe("Start timestamp in milliseconds"),
      to: z.number().describe("End timestamp in milliseconds"),
      offset: z.number().int().min(0).default(0).describe("Pagination offset"),
      limit: z.number().int().min(1).max(1000).default(50)
        .describe("Number of results per page (1-1000)"),
    },
    method: "receipts.get_all",
    buildParams: (args: { from: number; to: number; offset: number; limit: number }) => ({
      from: args.from,
      to: args.to,
      offset: args.offset,
      limit: args.limit,
    }),
  },
] as const;

export type ReceiptToolName = (typeof receiptTools)[number]["name"];

export async function handleReceiptTool(
  name: string,
  args: Record<string, unknown>,
  client: JsonRpcClient,
): Promise<unknown> {
  const tool = receiptTools.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown receipt tool: ${name}`);
  const params = tool.buildParams(args as never);
  return client.call(tool.method, params);
}
