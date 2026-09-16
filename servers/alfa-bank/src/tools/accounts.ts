/**
 * Account tools: list_accounts, get_account_balance, get_account_statement.
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import type { AlfaBankClient } from "../client.js";
import { READ_ONLY } from "../lib/annotations.js";
import { error, success } from "../lib/formatters.js";

export function registerAccountTools(server: McpServer, client: AlfaBankClient): void {
  server.registerTool(
    "list_accounts",
    {
      title: "List accounts",
      description:
        "List all business accounts in Alfa-Bank. Returns account numbers, currencies, types, and statuses.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      try {
        return success(await client.listAccounts());
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to list accounts.");
      }
    }),
  );

  server.registerTool(
    "get_account_balance",
    {
      title: "Get account balance",
      description: "Get the current balance of a specific Alfa-Bank business account by its ID.",
      inputSchema: {
        account_id: z.string().min(1).describe("The unique account identifier"),
      },
      annotations: READ_ONLY,
    },
    withErrorHandling(async (args) => {
      try {
        return success(await client.getAccountBalance(args.account_id));
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to get account balance.");
      }
    }),
  );

  server.registerTool(
    "get_account_statement",
    {
      title: "Get account statement",
      description:
        "Get account statement (transactions) for a date range. Returns credits, debits, opening/closing balance.",
      inputSchema: {
        account_id: z.string().min(1).describe("The account number"),
        date_from: z.string().describe("Start date in YYYY-MM-DD format"),
        date_to: z.string().describe("End date in YYYY-MM-DD format"),
      },
      annotations: READ_ONLY,
    },
    withErrorHandling(async (args) => {
      try {
        return success(await client.getAccountStatement(args.account_id, args.date_from, args.date_to));
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to get account statement.");
      }
    }),
  );
}
