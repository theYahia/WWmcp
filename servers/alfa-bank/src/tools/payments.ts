/**
 * Payment tools: create_payment_order (destructive), get_payment_status.
 *
 * ponytail: the inner try/catch keeps the published error texts (core's generic
 * "Повторите запрос" is the wrong nudge for a money-moving call);
 * withErrorHandling still sanitizes both the success and the error result.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import type { AlfaBankClient } from "../client.js";
import { PAYMENT, READ_ONLY } from "../lib/annotations.js";
import { error, success } from "../lib/formatters.js";

export function registerPaymentTools(server: McpServer, client: AlfaBankClient): void {
  server.registerTool(
    "create_payment_order",
    {
      title: "Create payment order",
      description:
        "Create a new payment order in Alfa-Bank (moves real money). Transfers funds from one account to " +
        "another using BIK and account number. Note: the production API submits payments as a SIGNED " +
        "registry — this requires a PKCS#7 GOST signature (see README); without an injected signer it " +
        "returns a clear error explaining what is needed.",
      inputSchema: {
        from_account: z.string().min(1).describe("Source account number"),
        to_account: z.string().min(1).describe("Destination account number"),
        to_bik: z.string().describe("Destination bank BIK (9 digits)"),
        amount: z.number().positive().describe("Amount in minor units (kopeks)"),
        purpose: z.string().min(1).describe("Payment purpose description"),
      },
      annotations: PAYMENT,
    },
    withErrorHandling(async (args) => {
      try {
        return success(
          await client.createPaymentOrder({
            fromAccount: args.from_account,
            toAccount: args.to_account,
            toBik: args.to_bik,
            amount: args.amount,
            purpose: args.purpose,
          }),
        );
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to create payment order.");
      }
    }),
  );

  server.registerTool(
    "get_payment_status",
    {
      title: "Get payment status",
      description: "Check the status of a previously created payment order by its ID.",
      inputSchema: {
        payment_id: z.string().min(1).describe("The payment order / registry ID"),
      },
      annotations: READ_ONLY,
    },
    withErrorHandling(async (args) => {
      try {
        return success(await client.getPaymentStatus(args.payment_id));
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to get payment status.");
      }
    }),
  );
}
