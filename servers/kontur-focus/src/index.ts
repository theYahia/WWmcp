#!/usr/bin/env node

/**
 * @theyahia/kontur-focus-mcp — MCP server for the Kontur.Focus API (Russia)
 *
 * 8 tools: search_company, get_company_brief, get_company_details,
 * get_financial_statements, get_arbitration_cases, get_bankruptcy_info,
 * get_licenses, get_related_companies.
 * Auth: KONTUR_FOCUS_API_KEY.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import {
  searchCompanySchema,
  handleSearchCompany,
  getCompanyBriefSchema,
  handleGetCompanyBrief,
  getCompanyDetailsSchema,
  handleGetCompanyDetails,
  getFinancialStatementsSchema,
  handleGetFinancialStatements,
  getArbitrationCasesSchema,
  handleGetArbitrationCases,
  getBankruptcyInfoSchema,
  handleGetBankruptcyInfo,
  getLicensesSchema,
  handleGetLicenses,
  getRelatedCompaniesSchema,
  handleGetRelatedCompanies,
} from "./tools/company.js";

const logger = createLogger("kontur-focus-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "kontur-focus-mcp",
    version: "3.0.1",
  });

  server.tool(
    "search_company",
    "Search company by INN, OGRN, or name in Kontur.Focus.",
    searchCompanySchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleSearchCompany(params) }],
    })),
  );

  server.tool(
    "get_company_brief",
    "Get brief company report by INN (risk summary).",
    getCompanyBriefSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCompanyBrief(params) }],
    })),
  );

  server.tool(
    "get_company_details",
    "Get full EGRUL extract for a company by INN.",
    getCompanyDetailsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetCompanyDetails(params) }],
    })),
  );

  server.tool(
    "get_financial_statements",
    "Get financial statements (balance sheet, P&L) by INN.",
    getFinancialStatementsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleGetFinancialStatements(params) },
      ],
    })),
  );

  server.tool(
    "get_arbitration_cases",
    "Get arbitration court cases by INN.",
    getArbitrationCasesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetArbitrationCases(params) }],
    })),
  );

  server.tool(
    "get_bankruptcy_info",
    "Get bankruptcy proceedings info by INN.",
    getBankruptcyInfoSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetBankruptcyInfo(params) }],
    })),
  );

  server.tool(
    "get_licenses",
    "Get company licenses by INN.",
    getLicensesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetLicenses(params) }],
    })),
  );

  server.tool(
    "get_related_companies",
    "Get affiliated/related companies by INN.",
    getRelatedCompaniesSchema.shape,
    withErrorHandling(async (params) => ({
      content: [
        { type: "text", text: await handleGetRelatedCompanies(params) },
      ],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "kontur-focus-mcp",
  version: "3.0.1",
  toolCount: 8,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
