import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "../../../../packages/core/dist/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");
const TOOL_COUNT = 14;

// Подставные значения — сервер только поднимается, наружу не ходит.
const ENV = {
  HUNTFLOW_BASE_URL: "https://example.test",
  HUNTFLOW_HTTP_HOST: "example.test",
  HUNTFLOW_HTTP_SECRET: "test",
  HUNTFLOW_REFRESH_TOKEN: "test",
  HUNTFLOW_TOKEN: "test",
};

const TOOL_NAMES = [
  "get_applicant",
  "get_applicant_resumes",
  "get_resume",
  "get_vacancy",
  "list_accounts",
  "list_coworkers",
  "list_divisions",
  "list_rejection_reasons",
  "list_sources",
  "list_stages",
  "list_tags",
  "list_vacancies",
  "list_vacancy_applicants",
  "search_applicants",
];

describe("Huntflow MCP E2E Smoke Test", () => {
  it("starts and lists 14 tools", async () => {
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
