import { describe, it, expect } from "vitest";
// Фабрика в server.ts: index.ts при импорте сразу запускает транспорт.
import { createMcpServer, TOOL_COUNT } from "../server.js";

describe("MCP Server", () => {
  it("creates server instance", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });

  it("TOOL_COUNT matches the 11 registered tools", () => {
    expect(TOOL_COUNT).toBe(11);
  });
});
