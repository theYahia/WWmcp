import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  searchCompanySchema, handleSearchCompany,
  getCompanyBriefSchema, handleGetCompanyBrief,
  getCompanyDetailsSchema, handleGetCompanyDetails,
  getFinancialStatementsSchema, handleGetFinancialStatements,
  getArbitrationCasesSchema, handleGetArbitrationCases,
  getBankruptcyInfoSchema, handleGetBankruptcyInfo,
  getLicensesSchema, handleGetLicenses,
  getRelatedCompaniesSchema, handleGetRelatedCompanies,
} from "../tools/company.js";

vi.mock("../client.js", () => ({
  focusGet: vi.fn().mockResolvedValue({ inn: "7707083893", ogrn: "1027700132195", name: "Test Company" }),
}));

import { focusGet } from "../client.js";
const mockFocusGet = vi.mocked(focusGet);

beforeEach(() => { mockFocusGet.mockClear(); });

describe("search_company", () => {
  it("validates schema with inn", () => {
    const result = searchCompanySchema.safeParse({ inn: "7707083893" });
    expect(result.success).toBe(true);
  });

  it("validates schema with name", () => {
    const result = searchCompanySchema.safeParse({ name: "Sberbank" });
    expect(result.success).toBe(true);
  });

  it("calls focusGet with /req and inn", async () => {
    await handleSearchCompany({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/req", { inn: "7707083893" });
  });

  it("throws when no params provided", async () => {
    await expect(handleSearchCompany({})).rejects.toThrow("At least one of inn, ogrn, or name must be provided.");
  });

  it("returns JSON string", async () => {
    const result = await handleSearchCompany({ inn: "7707083893" });
    const parsed = JSON.parse(result);
    expect(parsed.inn).toBe("7707083893");
  });
});

describe("get_company_brief", () => {
  it("calls focusGet with /briefReport", async () => {
    await handleGetCompanyBrief({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/briefReport", { inn: "7707083893" });
  });
});

describe("get_company_details", () => {
  it("calls focusGet with /egrDetails", async () => {
    await handleGetCompanyDetails({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/egrDetails", { inn: "7707083893" });
  });
});

describe("get_financial_statements", () => {
  it("calls focusGet with /analytics", async () => {
    await handleGetFinancialStatements({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/analytics", { inn: "7707083893" });
  });
});

describe("get_arbitration_cases", () => {
  it("calls focusGet with /arbitration", async () => {
    await handleGetArbitrationCases({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/arbitration", { inn: "7707083893" });
  });
});

describe("get_bankruptcy_info", () => {
  it("calls focusGet with /bankruptcy", async () => {
    await handleGetBankruptcyInfo({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/bankruptcy", { inn: "7707083893" });
  });
});

describe("get_licenses", () => {
  it("calls focusGet with /licenses", async () => {
    await handleGetLicenses({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/licenses", { inn: "7707083893" });
  });
});

describe("get_related_companies", () => {
  it("calls focusGet with /affiliates", async () => {
    await handleGetRelatedCompanies({ inn: "7707083893" });
    expect(mockFocusGet).toHaveBeenCalledWith("/affiliates", { inn: "7707083893" });
  });
});
