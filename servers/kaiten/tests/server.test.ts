import { describe, it, expect } from "vitest";
import { allTools } from "../src/index.js";

describe("server registry", () => {
  it("registers at least the core tools", () => {
    expect(allTools.length).toBeGreaterThanOrEqual(17);
  });

  it("has no duplicate tool names", () => {
    const names = allTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every tool has a name, description and zod schema", () => {
    for (const t of allTools) {
      expect(typeof t.name).toBe("string");
      expect(t.name.length).toBeGreaterThan(0);
      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.schema).toBeDefined();
      expect(t.schema.shape).toBeDefined();
      expect(typeof t.handler).toBe("function");
    }
  });

  it("exposes the renamed/expanded core tools", () => {
    const names = new Set(allTools.map((t) => t.name));
    for (const n of [
      "list_boards",
      "list_cards",
      "create_card",
      "move_card",
      "delete_card",
      "add_comment",
      "get_current_user",
    ]) {
      expect(names.has(n)).toBe(true);
    }
  });
});
