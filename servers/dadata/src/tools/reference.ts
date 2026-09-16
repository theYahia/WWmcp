/**
 * Reference lookup tool — single tool for all DaData reference directories.
 *
 * Instead of creating 12 separate tools for niche directories (OKVED, OKPD,
 * metro, courts, customs, tax offices, currencies, OKTMO, etc.), we group
 * them into one tool with a `directory` parameter. This keeps the tool count
 * manageable for LLM selection while providing full API coverage.
 *
 * All use Suggestions API (free, Token only).
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { callSuggestions } from "../client.js";
import { success, error } from "../lib/formatters.js";
import type { ReferenceData, SuggestResponse } from "../types.js";

const DIRECTORIES = {
  okved2: { endpoint: "suggest/okved2", description: "OKVED 2 — economic activity codes" },
  okpd2: { endpoint: "suggest/okpd2", description: "OKPD 2 — product/service codes" },
  oktmo: { endpoint: "suggest/oktmo", description: "OKTMO — municipal territory codes" },
  metro: { endpoint: "suggest/metro", description: "Metro stations (Moscow, SPb, etc.)" },
  fns_unit: { endpoint: "suggest/fns_unit", description: "Tax offices (FNS)" },
  fts_unit: { endpoint: "suggest/fts_unit", description: "Customs offices (FTS)" },
  region_court: { endpoint: "suggest/region_court", description: "Courts of Russia" },
  currency: { endpoint: "suggest/currency", description: "Currencies (ISO 4217)" },
  mktu: { endpoint: "suggest/mktu", description: "MKTU — trademark goods/services classes" },
  okpdtr_profession: { endpoint: "suggest/okpdtr", description: "OKPDTR — worker professions directory" },
  okpdtr_position: { endpoint: "suggest/okpdtr", description: "OKPDTR — employee positions directory" },
  medical_position: { endpoint: "suggest/okpdtr", description: "Medical worker positions directory" },
} as const;

type DirectoryKey = keyof typeof DIRECTORIES;

export function registerReferenceTools(server: McpServer): void {
  server.tool(
    "lookup_reference",
    "Search Russian reference directories: OKVED, OKPD, OKTMO, metro, tax/customs offices, courts, currencies, MKTU, professions, positions.",
    {
      directory: z
        .enum(Object.keys(DIRECTORIES) as [DirectoryKey, ...DirectoryKey[]])
        .describe(
          "Directory to search: okved2, okpd2, oktmo, metro, fns_unit, fts_unit, region_court, currency, mktu, okpdtr_profession, okpdtr_position, medical_position",
        ),
      query: z
        .string()
        .min(1)
        .max(300)
        .describe("Search query — code or name"),
      count: z.number().int().min(1).max(20).default(5),
    },
    withErrorHandling(async (params) => {
      const dir = DIRECTORIES[params.directory];
      const result = await callSuggestions(dir.endpoint, {
        query: params.query,
        count: params.count,
      });
      if (result.error) return error(result.error);

      const resp = result.data as SuggestResponse<ReferenceData>;
      if (!resp.suggestions?.length) {
        return success({
          status: "no_results",
          directory: params.directory,
          directory_description: dir.description,
          message: `No results in ${dir.description} for "${params.query}".`,
        });
      }

      return success({
        directory: params.directory,
        directory_description: dir.description,
        count: resp.suggestions.length,
        results: resp.suggestions.map((s) => ({
          value: s.value,
          data: s.data,
        })),
      });
    }),
  );
}
