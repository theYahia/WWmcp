import { describe, it, expect } from "vitest";
import { createServer } from "../src/index.js";

describe("server", () => {
  it("createServer returns McpServer instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });
});
