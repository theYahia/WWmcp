import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("2gis server factory", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["TWOGIS_API_KEY"] = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("createServer returns a connectable McpServer", async () => {
    const { createServer, TOOL_COUNT } = await import("../src/server.js");
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(TOOL_COUNT).toBe(8);
  });
});
