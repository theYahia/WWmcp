import { z } from "zod";
import type { TochkaBankClient } from "../client.js";
import { isoDateSchema } from "../validation.js";
import { jsonResult, type ToolDef } from "./_shared.js";

export const listAccountsTool: ToolDef = {
  name: "list_accounts",
  config: {
    title: "List accounts",
    description:
      "List all business accounts in Tochka Bank (account IDs, currencies, types, statuses).",
    inputSchema: {},
    outputSchema: { accounts: z.array(z.unknown()) },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (client: TochkaBankClient) => {
    const accounts = await client.listAccounts();
    return jsonResult({ accounts });
  },
};

export const getAccountBalanceTool: ToolDef = {
  name: "get_account_balance",
  config: {
    title: "Get account balances",
    description:
      "Get the balances of a Tochka Bank account by its accountId. Returns multiple rows (one per balance type: OpeningAvailable, ClosingAvailable, Expected, OverdraftAvailable); each value is under Amount.amount.",
    inputSchema: {
      account_id: z.string().min(1).describe("The accountId (from list_accounts)"),
    },
    outputSchema: { balances: z.array(z.unknown()) },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (client: TochkaBankClient, args: { account_id: string }) => {
    const balances = await client.getAccountBalances(args.account_id);
    return jsonResult({ balances });
  },
};

export const getStatementTool: ToolDef = {
  name: "get_statement",
  config: {
    title: "Get statement",
    description:
      "Get an account statement (transactions) for a date range. The Tochka statement API is asynchronous: this tool creates the request and polls until it is Ready. If it is not ready within the timeout, it returns the statementId and a 'pending' status so you can retry later.",
    inputSchema: {
      account_id: z.string().min(1).describe("The accountId (from list_accounts)"),
      date_from: isoDateSchema.describe("Start date YYYY-MM-DD"),
      date_to: isoDateSchema.describe("End date YYYY-MM-DD"),
    },
    outputSchema: {
      status: z.string(),
      statementId: z.string().optional(),
      statements: z.array(z.unknown()).optional(),
      transactions: z.array(z.unknown()).optional(),
      message: z.string().optional(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  handler: async (
    client: TochkaBankClient,
    args: { account_id: string; date_from: string; date_to: string },
  ) => {
    const result = await client.getStatementBlocking(args.account_id, args.date_from, args.date_to);
    if (result.status !== "Ready") {
      return jsonResult({
        status: result.status === "Error" ? "error" : "pending",
        statementId: result.statementId,
        message:
          result.status === "Error"
            ? "Statement generation failed."
            : "Statement is not ready yet; retry get_statement later (generation is asynchronous).",
        transactions: [],
      });
    }
    const transactions = result.statements.flatMap((s) => s.Transaction ?? []);
    return jsonResult({
      status: "Ready",
      statementId: result.statementId,
      statements: result.statements,
      transactions,
    });
  },
};
