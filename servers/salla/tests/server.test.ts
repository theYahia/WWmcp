import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/server.js";

describe("salla server factory", () => {
  it("createServer returns a connectable McpServer", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT matches the 9 tools the server registers", () => {
    expect(TOOL_COUNT).toBe(9);
  });
});
