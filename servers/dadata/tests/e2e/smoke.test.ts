import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 31;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  DADATA_API_KEY: "test",
  DADATA_SECRET_KEY: "test",
};

const TOOL_NAMES = [
  "clean_address",
  "clean_email",
  "clean_name",
  "clean_passport",
  "clean_person",
  "clean_phone",
  "clean_vehicle",
  "find_affiliated",
  "find_bank",
  "find_brand",
  "find_by_id_address",
  "find_company_by_email",
  "find_company_by_id",
  "find_delivery_city",
  "find_fms_unit",
  "find_inn_by_passport",
  "find_postal_unit",
  "find_self_employed",
  "geolocate_address",
  "get_balance",
  "get_versions",
  "ip_locate",
  "lookup_reference",
  "suggest_address",
  "suggest_car_brand",
  "suggest_company",
  "suggest_company_by",
  "suggest_company_kz",
  "suggest_country",
  "suggest_email",
  "suggest_fio",
];

describe("DaData MCP E2E Smoke Test", () => {
  it("starts and lists 31 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(TOOL_COUNT);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: TOOL_COUNT,
      env: ENV,
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(TOOL_NAMES);
  }, 15_000);
});
