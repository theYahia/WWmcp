import { describe, it, expect } from "vitest";
import { createServer, TOOL_COUNT } from "../src/index.js";

describe("server", () => {
  it("creates server instance", () => {
    const server = createServer();
    expect(server).toBeDefined();
  });

  it("registers exactly TOOL_COUNT (20) tools", () => {
    const server = createServer();
    // McpServer хранит зарегистрированные инструменты во внутреннем реестре.
    const registered = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    const names = Object.keys(registered);
    expect(names.length).toBe(TOOL_COUNT);
    expect(TOOL_COUNT).toBe(20);
  });

  it("includes the corrected & new tool names", () => {
    const server = createServer();
    const registered = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools;
    const names = Object.keys(registered);
    // выборка ключевых: исправленные + новые
    for (const expected of [
      "get_tasks", "start_process", "complete_task", "get_task_exits",
      "list_namespaces", "list_apps", "get_app_schema",
      "get_app_item", "update_app_item", "set_app_item_status",
      "get_process_instances", "reassign_task",
    ]) {
      expect(names).toContain(expected);
    }
  });
});
