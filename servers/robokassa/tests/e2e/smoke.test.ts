import { describe, it, expect } from "vitest";
import { resolve } from "node:path";
import { runSmokeTest } from "@theyahia/mcp-core/testing/smoke.js";

const SERVER_PATH = resolve(import.meta.dirname, "../../dist/index.js");

describe("Robokassa MCP E2E Smoke Test", () => {
  it("starts and lists 2 tools", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 2,
      env: { ROBOKASSA_LOGIN: "test", ROBOKASSA_PASSWORD1: "test", ROBOKASSA_PASSWORD2: "test" },
    });

    expect(result.connected).toBe(true);
    expect(result.toolCount).toBe(2);
    expect(result.errors).toHaveLength(0);
  }, 15_000);

  it("all tools have quality descriptions (20+ chars)", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 2,
      env: { ROBOKASSA_LOGIN: "test", ROBOKASSA_PASSWORD1: "test", ROBOKASSA_PASSWORD2: "test" },
    });

    for (const tool of result.tools) {
      expect(tool.descriptionLength).toBeGreaterThanOrEqual(20);
      expect(tool.hasInputSchema).toBe(true);
    }
  }, 15_000);

  it("has expected tool names", async () => {
    const result = await runSmokeTest({
      serverPath: SERVER_PATH,
      expectedToolCount: 2,
      env: { ROBOKASSA_LOGIN: "test", ROBOKASSA_PASSWORD1: "test", ROBOKASSA_PASSWORD2: "test" },
    });

    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "check_invoice",
      "create_invoice",
    ]);
  }, 15_000);
});
