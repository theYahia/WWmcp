/**
 * Extra email tools: suggest_email.
 *
 * Suggestions API (free, Token only).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { EmailData, SuggestResponse } from "../types.js";

export function registerEmailExtraTools(server: McpServer): void {
  server.tool(
    "suggest_email",
    "Autocomplete email addresses. Suggests domains and corrects typos as user types.",
    {
      query: z
        .string()
        .min(1)
        .max(200)
        .describe("Partial email, e.g. 'john@gma'"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const result = await callSuggestions("suggest/email", {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<EmailData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          message: `No email suggestions for "${params.query}".`,
        });
      }

      return success({
        count: resp.suggestions.length,
        suggestions: resp.suggestions.map((s) => ({
          email: s.value,
          local: s.data.local,
          domain: s.data.domain,
        })),
      });
    }),
  );
}
