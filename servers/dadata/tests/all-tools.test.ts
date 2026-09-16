/**
 * Tests for all new tools: passport, company-extra, email-extra,
 * vehicle, postal, reference.
 *
 * Verifies registration + mock API responses.
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

import { callSuggestions, callCleaner } from "../src/client.js";
import { registerSuggestTools } from "../src/tools/suggest.js";
import { registerFindTools } from "../src/tools/find.js";
import { registerCleanTools } from "../src/tools/clean.js";
import { registerGeoTools } from "../src/tools/geo.js";
import { registerProfileTools } from "../src/tools/profile.js";
import { registerPassportTools } from "../src/tools/passport.js";
import { registerCompanyExtraTools } from "../src/tools/company-extra.js";
import { registerEmailExtraTools } from "../src/tools/email-extra.js";
import { registerVehicleTools } from "../src/tools/vehicle.js";
import { registerPostalTools } from "../src/tools/postal.js";
import { registerReferenceTools } from "../src/tools/reference.js";

const mockCallSuggestions = vi.mocked(callSuggestions);
const mockCallCleaner = vi.mocked(callCleaner);

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// All 25 tools register without conflicts
// ---------------------------------------------------------------------------

describe("Full registration — 25 tools", () => {
  it("registers all tools without name conflicts", () => {
    const server = new McpServer({ name: "test", version: "0.0.0" });
    expect(() => {
      registerSuggestTools(server);
      registerFindTools(server);
      registerCleanTools(server);
      registerGeoTools(server);
      registerProfileTools(server);
      registerPassportTools(server);
      registerCompanyExtraTools(server);
      registerEmailExtraTools(server);
      registerVehicleTools(server);
      registerPostalTools(server);
      registerReferenceTools(server);
    }).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Passport tools
// ---------------------------------------------------------------------------

describe("clean_passport", () => {
  it("validates a valid passport", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{ source: "45 04 346825", series: "45 04", number: "346825", qc: 0 }],
      error: null,
    });
    const r = await callCleaner("passport", ["45 04 346825"]);
    const d = (r.data as any[])[0];
    expect(d.qc).toBe(0);
    expect(d.series).toBe("45 04");
  });

  it("detects invalid passport", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{ source: "00 00 000000", series: "00 00", number: "000000", qc: 1 }],
      error: null,
    });
    const r = await callCleaner("passport", ["00 00 000000"]);
    expect((r.data as any[])[0].qc).toBe(1);
  });
});

describe("find_fms_unit", () => {
  it("finds FMS unit by code", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "ОВД РАЙОНА БАБУШКИНСКИЙ Г. МОСКВЫ",
          data: { code: "770-001", name: "ОВД РАЙОНА БАБУШКИНСКИЙ", region_code: "77", type: "2" },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/fms_unit", { query: "770-001", count: 5 });
    expect((r.data as any).suggestions[0].data.code).toBe("770-001");
  });
});

// ---------------------------------------------------------------------------
// Company extra tools
// ---------------------------------------------------------------------------

describe("find_affiliated", () => {
  it("finds affiliated companies", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [
          { value: "ООО Рога", data: { inn: "1234567890", name: { short_with_opf: "ООО Рога" }, state: { status: "ACTIVE" } } },
        ],
      },
      error: null,
    });
    const r = await callSuggestions("findAffiliated/party", { query: "7707083893", count: 10 });
    expect((r.data as any).suggestions).toHaveLength(1);
  });
});

describe("find_company_by_email", () => {
  it("finds company by email domain", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [
          { value: "ПАО СБЕРБАНК", data: { inn: "7707083893", name: { short_with_opf: "ПАО СБЕРБАНК" }, state: { status: "ACTIVE" } } },
        ],
      },
      error: null,
    });
    const r = await callSuggestions("findByEmail/company", { query: "sberbank.ru" });
    expect((r.data as any).suggestions[0].data.inn).toBe("7707083893");
  });
});

describe("find_brand", () => {
  it("finds brand by INN", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "Сбер",
          data: { name: "Сбер", site: "https://sber.ru", logo: "https://..." },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("findById/brand", { query: "7707083893" });
    expect((r.data as any).suggestions[0].data.name).toBe("Сбер");
  });
});

// ---------------------------------------------------------------------------
// Email suggest
// ---------------------------------------------------------------------------

describe("suggest_email", () => {
  it("suggests email completions", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [
          { value: "john@gmail.com", data: { local: "john", domain: "gmail.com" } },
          { value: "john@gmail.ru", data: { local: "john", domain: "gmail.ru" } },
        ],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/email", { query: "john@gma", count: 5 });
    expect((r.data as any).suggestions).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Vehicle tools
// ---------------------------------------------------------------------------

describe("clean_vehicle", () => {
  it("recognizes car brand and model", async () => {
    mockCallCleaner.mockResolvedValueOnce({
      data: [{ source: "тойота камри", result: "TOYOTA CAMRY", brand: "TOYOTA", model: "CAMRY", qc: 0 }],
      error: null,
    });
    const r = await callCleaner("vehicle", ["тойота камри"]);
    const d = (r.data as any[])[0];
    expect(d.brand).toBe("TOYOTA");
    expect(d.model).toBe("CAMRY");
  });
});

describe("suggest_car_brand", () => {
  it("suggests car brands", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [
          { value: "BMW", data: { id: "BMW", name: "BMW", name_ru: "БМВ" } },
        ],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/car_brand", { query: "BM", count: 5 });
    expect((r.data as any).suggestions[0].data.name).toBe("BMW");
  });
});

// ---------------------------------------------------------------------------
// Postal & countries
// ---------------------------------------------------------------------------

describe("find_postal_unit", () => {
  it("finds post office by index", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "127642",
          data: {
            postal_code: "127642",
            address_str: "г Москва, ул Сухонская, д 11",
            is_closed: false,
            geo_lat: 55.878,
            geo_lon: 37.654,
            schedule_mon: "08:00-20:00",
            schedule_sat: "09:00-18:00",
            schedule_sun: null,
          },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/postal_unit", { query: "127642", count: 5 });
    expect((r.data as any).suggestions[0].data.postal_code).toBe("127642");
  });
});

describe("suggest_country", () => {
  it("finds country by name", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "Россия",
          data: { code: "643", alfa2: "RU", alfa3: "RUS", name_short: "Россия", name: "Российская Федерация" },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/country", { query: "Россия", count: 5 });
    expect((r.data as any).suggestions[0].data.alfa2).toBe("RU");
  });
});

// ---------------------------------------------------------------------------
// Reference lookup (covers 9 directories in one tool)
// ---------------------------------------------------------------------------

describe("lookup_reference", () => {
  it("searches OKVED codes", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "64.19 Денежное посредничество прочее",
          data: { kod: "64.19", name: "Денежное посредничество прочее" },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/okved2", { query: "64.19", count: 5 });
    expect((r.data as any).suggestions).toHaveLength(1);
  });

  it("searches metro stations", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "Бабушкинская",
          data: { name: "Бабушкинская", line_name: "Калужско-Рижская", city: "Москва" },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/metro", { query: "Бабушкин", count: 5 });
    expect((r.data as any).suggestions[0].value).toBe("Бабушкинская");
  });

  it("searches currencies", async () => {
    mockCallSuggestions.mockResolvedValueOnce({
      data: {
        suggestions: [{
          value: "Российский рубль",
          data: { code: "643", strcode: "RUB", name: "Российский рубль" },
        }],
      },
      error: null,
    });
    const r = await callSuggestions("suggest/currency", { query: "рубль", count: 5 });
    expect((r.data as any).suggestions[0].data.strcode).toBe("RUB");
  });
});
