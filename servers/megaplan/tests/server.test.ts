import { describe, it, expect } from "vitest";
import { createServer } from "../src/index.js";

describe("createServer", () => {
  it("returns an McpServer instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
    expect(typeof server.tool).toBe("function");
    expect(typeof server.prompt).toBe("function");
  });
});
