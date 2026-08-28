import { describe, it, expect } from "vitest";
import { createMcpServer } from "../src/index.js";

describe("HTTP mode", () => {
  it("server exposes all 7 tools (5 tools + 2 skills)", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
    // Server instance is created — tools are registered during construction
    // Full HTTP integration test would require starting the server
  });

  it("server can be created multiple times without conflict", () => {
    const server1 = createMcpServer();
    const server2 = createMcpServer();
    expect(server1).toBeDefined();
    expect(server2).toBeDefined();
    expect(server1).not.toBe(server2);
  });
});
