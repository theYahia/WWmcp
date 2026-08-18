import { describe, it, expect } from "vitest";
import { createPlanfixServer, TOOL_COUNT } from "../src/server.js";

describe("createPlanfixServer", () => {
  it("creates a server instance", () => {
    const server = createPlanfixServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });

  it("TOOL_COUNT is 20", () => {
    expect(TOOL_COUNT).toBe(20);
  });
});
