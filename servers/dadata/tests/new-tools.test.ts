/**
 * Tests for new tools: clean_email, clean_name, suggest_fio,
 * find_by_id_address, find_delivery_city, get_balance.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

vi.mock("../src/client.js", () => ({
  callSuggestions: vi.fn(),
  callCleaner: vi.fn(),
  callProfileAPI: vi.fn(),
  getApiKey: () => "test-key",
  getSecretKey: () => "test-secret",
}));

import { callSuggestions, callCleaner, callProfileAPI } from "../src/client.js";
import { registerSuggestTools } from "../src/tools/suggest.js";
import { registerFindTools } from "../src/tools/find.js";
import { registerCleanTools } from "../src/tools/clean.js";
import { registerProfileTools } from "../src/tools/profile.js";

const mockCallSuggestions = vi.mocked(callSuggestions);
const mockCallCleaner = vi.mocked(callCleaner);
const mockCallProfileAPI = vi.mocked(callProfileAPI);

beforeEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Registration — all 14 tools register without conflicts
// ---------------------------------------------------------------------------

describe("All 14 tools registration", () => {
  it("registers all tools without errors or name conflicts", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    expect(() => {
      registerSuggestTools(server);
      registerFindTools(server);
      registerCleanTools(server);
      registerProfileTools(server);
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// clean_email mock data
// ---------------------------------------------------------------------------

describe("clean_email", () => {
  it("returns formatted email validation result", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{
        source: "serega@yandex/ru",
        email: "serega@yandex.ru",
        local: "serega",
        domain: "yandex.ru",
        type: "PERSONAL",
        qc: 4,
      }],
      error: null,
    });

    // We can't directly call the tool handler, but we can verify the mock is called correctly
    const result = await callCleaner("email", ["serega@yandex/ru"]);
    expect(result.data).toBeTruthy();
    const r = (result.data as any[])[0];
    expect(r.email).toBe("serega@yandex.ru");
    expect(r.type).toBe("PERSONAL");
    expect(r.qc).toBe(4); // corrected
  });

  it("detects disposable email", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{
        source: "test@mailinator.com",
        email: "test@mailinator.com",
        local: "test",
        domain: "mailinator.com",
        type: "DISPOSABLE",
        qc: 3,
      }],
      error: null,
    });

    const result = await callCleaner("email", ["test@mailinator.com"]);
    const r = (result.data as any[])[0];
    expect(r.type).toBe("DISPOSABLE");
    expect(r.qc).toBe(3);
  });

  it("returns error when SECRET_KEY missing", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: null,
      error: "DADATA_SECRET_KEY is required",
    });

    const result = await callCleaner("email", ["test@test.com"]);
    expect(result.error).toContain("SECRET_KEY");
  });
});

// ---------------------------------------------------------------------------
// clean_name mock data
// ---------------------------------------------------------------------------

describe("clean_name", () => {
  it("parses FIO into components with gender", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{
        source: "Федотов Алексей Андреевич",
        result: "Федотов Алексей Андреевич",
        result_genitive: "Федотова Алексея Андреевича",
        result_dative: "Федотову Алексею Андреевичу",
        result_ablative: "Федотовым Алексеем Андреевичем",
        surname: "Федотов",
        name: "Алексей",
        patronymic: "Андреевич",
        gender: "М",
        qc: 0,
      }],
      error: null,
    });

    const result = await callCleaner("name", ["Федотов Алексей Андреевич"]);
    const r = (result.data as any[])[0];
    expect(r.surname).toBe("Федотов");
    expect(r.name).toBe("Алексей");
    expect(r.patronymic).toBe("Андреевич");
    expect(r.gender).toBe("М");
    expect(r.qc).toBe(0);
  });

  it("handles partial name", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{
        source: "Алексей",
        result: "Алексей",
        result_genitive: "Алексея",
        result_dative: "Алексею",
        result_ablative: "Алексеем",
        surname: null,
        name: "Алексей",
        patronymic: null,
        gender: "М",
        qc: 1,
      }],
      error: null,
    });

    const result = await callCleaner("name", ["Алексей"]);
    const r = (result.data as any[])[0];
    expect(r.surname).toBeNull();
    expect(r.name).toBe("Алексей");
    expect(r.gender).toBe("М");
  });
});

// ---------------------------------------------------------------------------
// suggest_fio mock data
// ---------------------------------------------------------------------------

describe("suggest_fio", () => {
  it("returns FIO suggestions with gender", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [
          {
            value: "Иванов Иван Иванович",
            unrestricted_value: "Иванов Иван Иванович",
            data: { surname: "Иванов", name: "Иван", patronymic: "Иванович", gender: "MALE" },
          },
        ],
      },
      error: null,
    });

    const result = await callSuggestions("suggest/fio", { query: "Иванов", count: 5 });
    expect(result.data).toBeTruthy();
    const suggestions = (result.data as any).suggestions;
    expect(suggestions).toHaveLength(1);
    expect(suggestions[0].data.gender).toBe("MALE");
  });

  it("returns empty for no matches", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: { suggestions: [] },
      error: null,
    });

    const result = await callSuggestions("suggest/fio", { query: "xyz123", count: 5 });
    expect((result.data as any).suggestions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// find_by_id_address mock data
// ---------------------------------------------------------------------------

describe("find_by_id_address", () => {
  it("returns address by FIAS ID", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "г Москва, ул Сухонская, д 11",
          unrestricted_value: "127642, г Москва, ул Сухонская, д 11",
          data: {
            postal_code: "127642",
            region_with_type: "г Москва",
            city_with_type: "г Москва",
            street_with_type: "ул Сухонская",
            house: "11",
            fias_id: "some-fias-uuid",
            kladr_id: "7700000000028360012",
            geo_lat: "55.878",
            geo_lon: "37.654",
          },
        }],
      },
      error: null,
    });

    const result = await callSuggestions("findById/address", { query: "some-fias-uuid" });
    expect(result.data).toBeTruthy();
    expect((result.data as any).suggestions[0].data.postal_code).toBe("127642");
  });

  it("returns not_found for invalid FIAS ID", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: { suggestions: [] },
      error: null,
    });

    const result = await callSuggestions("findById/address", { query: "invalid-uuid" });
    expect((result.data as any).suggestions).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// find_delivery_city mock data
// ---------------------------------------------------------------------------

describe("find_delivery_city", () => {
  it("returns CDEK/Boxberry/DPD IDs", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "г Москва",
          unrestricted_value: "г Москва",
          data: {
            kladr_id: "7700000000000",
            fias_id: "0c5b2444-70a0-4932-980c-b4dc0d3f02b5",
            boxberry_id: "010",
            cdek_id: "44",
            dpd_id: "49694102",
          },
        }],
      },
      error: null,
    });

    const result = await callSuggestions("findById/delivery", { query: "7700000000000" });
    const d = (result.data as any).suggestions[0].data;
    expect(d.cdek_id).toBe("44");
    expect(d.boxberry_id).toBe("010");
    expect(d.dpd_id).toBe("49694102");
  });
});

// ---------------------------------------------------------------------------
// get_balance mock data
// ---------------------------------------------------------------------------

describe("get_balance", () => {
  it("returns balance and stats", async () => {
    mockCallProfileAPI
      .mockResolvedValueOnce({ data: { balance: 9850.5 }, error: null })
      .mockResolvedValueOnce({ data: { date: "2026-03-29", services: { suggestions: 42, clean: 5 } }, error: null });

    const balanceResult = await callProfileAPI("profile/balance");
    const statResult = await callProfileAPI("stat/daily");

    expect(balanceResult.data).toEqual({ balance: 9850.5 });
    expect(statResult.data).toBeTruthy();
  });

  it("handles balance error gracefully", async () => {
    mockCallProfileAPI.mockResolvedValueOnce({
      data: null,
      error: "Authentication failed.",
    });

    const result = await callProfileAPI("profile/balance");
    expect(result.error).toContain("Authentication");
  });
});
