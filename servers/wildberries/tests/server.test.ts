import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/server.js";
import { WBClient } from "../src/client.js";

describe("wildberries server factory", () => {
  it("createServer accepts an injected WBClient (testability)", () => {
    const client = new WBClient({ token: "test-token" });
    const server = createServer(client);
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT matches the toolDefinitions registry", () => {
    expect(TOOL_COUNT).toBeGreaterThanOrEqual(12);
  });
});
