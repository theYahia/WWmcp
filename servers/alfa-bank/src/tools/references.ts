/**
 * Reference tools: list_counterparties, get_exchange_rates, get_salary_registry.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import type { AlfaBankClient } from "../client.js";
import { READ_ONLY } from "../lib/annotations.js";
import { error, success } from "../lib/formatters.js";

export function registerReferenceTools(server: McpServer, client: AlfaBankClient): void {
  server.registerTool(
    "list_counterparties",
    {
      title: "List counterparties",
      description:
        "List all saved counterparties (business partners / beneficiaries) in Alfa-Bank. Returns names, " +
        "INN, KPP, BIK, and account numbers.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      try {
        return success(await client.listCounterparties());
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to list counterparties.");
      }
    }),
  );

  server.registerTool(
    "get_exchange_rates",
    {
      title: "Get exchange rates",
      description:
        "Get current currency exchange rates from Alfa-Bank, including buy/sell rates and Central Bank rate.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      try {
        return success(await client.getExchangeRates());
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to get exchange rates.");
      }
    }),
  );

  server.registerTool(
    "get_salary_registry",
    {
      title: "Get salary registry",
      description:
        "Get payroll (salary) registries from Alfa-Bank. Returns registry status, total amount, and employee count.",
      inputSchema: {},
      annotations: READ_ONLY,
    },
    withErrorHandling(async () => {
      try {
        return success(await client.getSalaryRegistry());
      } catch (err) {
        return error(err instanceof Error ? err.message : "Failed to get salary registry.");
      }
    }),
  );
}
