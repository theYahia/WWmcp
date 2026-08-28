import { z } from "zod";
import { focusGet } from "../client.js";

// --- search_company ---

export const searchCompanySchema = z.object({
  inn: z.string().optional().describe("INN (taxpayer ID) of the company"),
  ogrn: z.string().optional().describe("OGRN (registration number) of the company"),
  name: z.string().optional().describe("Company name to search for"),
});

export async function handleSearchCompany(params: z.infer<typeof searchCompanySchema>): Promise<string> {
  if (!params.inn && !params.ogrn && !params.name) {
    throw new Error("At least one of inn, ogrn, or name must be provided.");
  }
  const query: Record<string, string> = {};
  if (params.inn) query.inn = params.inn;
  if (params.ogrn) query.ogrn = params.ogrn;
  if (params.name) query.name = params.name;
  const result = await focusGet("/req", query);
  return JSON.stringify(result, null, 2);
}

// --- get_company_brief ---

export const getCompanyBriefSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetCompanyBrief(params: z.infer<typeof getCompanyBriefSchema>): Promise<string> {
  const result = await focusGet("/briefReport", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_company_details ---

export const getCompanyDetailsSchema = z.object({
  inn: z.string().describe("INN of the company for full EGRUL extract"),
});

export async function handleGetCompanyDetails(params: z.infer<typeof getCompanyDetailsSchema>): Promise<string> {
  const result = await focusGet("/egrDetails", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_financial_statements ---

export const getFinancialStatementsSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetFinancialStatements(params: z.infer<typeof getFinancialStatementsSchema>): Promise<string> {
  const result = await focusGet("/analytics", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_arbitration_cases ---

export const getArbitrationCasesSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetArbitrationCases(params: z.infer<typeof getArbitrationCasesSchema>): Promise<string> {
  const result = await focusGet("/arbitration", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_bankruptcy_info ---

export const getBankruptcyInfoSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetBankruptcyInfo(params: z.infer<typeof getBankruptcyInfoSchema>): Promise<string> {
  const result = await focusGet("/bankruptcy", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_licenses ---

export const getLicensesSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetLicenses(params: z.infer<typeof getLicensesSchema>): Promise<string> {
  const result = await focusGet("/licenses", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}

// --- get_related_companies ---

export const getRelatedCompaniesSchema = z.object({
  inn: z.string().describe("INN of the company"),
});

export async function handleGetRelatedCompanies(params: z.infer<typeof getRelatedCompaniesSchema>): Promise<string> {
  const result = await focusGet("/affiliates", { inn: params.inn });
  return JSON.stringify(result, null, 2);
}
