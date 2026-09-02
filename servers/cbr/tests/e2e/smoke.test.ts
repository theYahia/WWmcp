import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");

describe("CBR MCP E2E Smoke Test", () => {
  it("starts and lists 7 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 7,
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(7);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 7,
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 7,
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "convert_currency",
      "get_currency_rate",
      "get_daily_rates",
      "get_key_rate",
      "get_key_rate_history",
      "get_precious_metals",
      "get_rate_dynamics",
    ]);
  }, 15_000);
});
