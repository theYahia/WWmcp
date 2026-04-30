/**
 * Tests for 2GIS MCP tools.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSearchTools } from "../src/tools/search.js";
import { registerGeocodingTools } from "../src/tools/geocoding.js";
import { registerDirectionsTools } from "../src/tools/directions.js";
import { registerReviewsTools } from "../src/tools/reviews.js";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  process.env.TWOGIS_API_KEY = "test-key";
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.TWOGIS_API_KEY;
});

describe("tool registration", () => {
  it("registers all 8 tools without errors", () => {
    const server = new McpServer({ name: "test", version: "1.0.0" });
    expect(() => {
      registerSearchTools(server);
      registerGeocodingTools(server);
      registerDirectionsTools(server);
      registerReviewsTools(server);
    }).not.toThrow();
  });
});

describe("formatters", () => {
  it("success returns JSON content", async () => {
    const { success } = await import("../src/lib/formatters.js");
    const result = success({ items: [1, 2, 3] });
    expect(result.content[0].type).toBe("text");
    expect(JSON.parse(result.content[0].text)).toEqual({ items: [1, 2, 3] });
  });

  it("error returns isError flag", async () => {
    const { error } = await import("../src/lib/formatters.js");
    const result = error("something went wrong");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("something went wrong");
  });
});
