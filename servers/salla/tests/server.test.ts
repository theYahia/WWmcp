import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/server.js";

describe("salla server factory", () => {
  it("createServer returns a connectable McpServer", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT matches the 24 tools the server registers (9 base + 5 catalog + 1 webhook + 9 coverage)", () => {
    expect(TOOL_COUNT).toBe(24);
  });
});
