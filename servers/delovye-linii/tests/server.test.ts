import { describe, it, expect, vi } from "vitest";

process.env.DELLIN_API_KEY = "test-key";
vi.stubGlobal("fetch", vi.fn());

import { createMcpServer } from "../src/index.js";

describe("MCP Server", () => {
  it("creates server instance", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });
});
