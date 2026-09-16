import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 19;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  HH_ACCESS_TOKEN: "test",
};

const TOOL_NAMES = [
  "get_areas",
  "get_areas_subtree",
  "get_dictionaries",
  "get_employer",
  "get_employer_vacancies",
  "get_industries",
  "get_metro",
  "get_professional_roles",
  "get_resume",
  "get_salary_statistics",
  "get_similar_vacancies",
  "get_vacancy",
  "search_employers",
  "search_resumes",
  "search_vacancies",
  "suggest_areas",
  "suggest_companies",
  "suggest_positions",
  "validate_token",
];

describe("Hh MCP E2E Smoke Test", () => {
  it("starts and lists 19 tools", async () => {
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
