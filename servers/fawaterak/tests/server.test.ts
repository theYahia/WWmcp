import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/server.js";

describe("fawaterak server factory", () => {
  it("createServer returns a connectable McpServer", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT is 8", () => {
    expect(TOOL_COUNT).toBe(8);
  });
});
