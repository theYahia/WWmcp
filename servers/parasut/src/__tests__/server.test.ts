import { describe, it, expect } from "vitest";
import { z } from "zod";
import { allTools, TOOL_COUNT } from "../src/index.js";

describe("tool registry", () => {
  it("registers a non-trivial set of tools", () => {
    expect(allTools.length).toBeGreaterThanOrEqual(30);
  });

  it("derives TOOL_COUNT from the array (never hardcoded)", () => {
    expect(TOOL_COUNT).toBe(allTools.length);
  });

  it("has no duplicate tool names", () => {
    const names = allTools.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("every tool has a name, description, ZodObject schema and handler", () => {
    for (const t of allTools) {
      expect(typeof t.name).toBe("string");
      expect(t.name.length).toBeGreaterThan(0);
      expect(typeof t.description).toBe("string");
      expect(t.description.length).toBeGreaterThan(0);
      expect(t.schema).toBeInstanceOf(z.ZodObject);
      expect(typeof t.handler).toBe("function");
    }
  });

  it("exposes the load-bearing accounting tools", () => {
    const names = new Set(allTools.map((t) => t.name));
    for (const expected of [
      "list_contacts",
      "create_contact",
      "create_sales_invoice",
      "record_sales_invoice_payment",
      "list_accounts",
      "issue_e_document",
      "check_einvoice_inbox",
      "get_trackable_job",
      "get_me",
    ]) {
      expect(names.has(expected)).toBe(true);
    }
  });
});
