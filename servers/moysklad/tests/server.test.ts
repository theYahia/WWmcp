import { describe, it, expect, vi } from "vitest";

vi.mock("@modelcontextprotocol/sdk/server/stdio.js", () => ({
  StdioServerTransport: vi.fn(),
}));

// Prevent process.exit from killing the test runner
vi.spyOn(process, "exit").mockImplementation((() => {}) as any);

// The 21 tools that shipped in 3.0.x — these must never disappear (back-compat).
const ORIGINAL_TOOLS = [
  "search_products",
  "get_product",
  "create_product",
  "update_prices",
  "get_stock",
  "get_stock_by_store",
  "get_counterparties",
  "get_counterparty",
  "create_counterparty",
  "create_customer_order",
  "get_orders",
  "get_customer_order",
  "update_customer_order_status",
  "create_demand",
  "create_supply",
  "list_stores",
  "list_organizations",
  "get_profit_report",
  "get_sales_report",
  "list_webhooks",
  "create_webhook",
];

describe("server smoke test", () => {
  it("registers every tool from the registry with no duplicates", async () => {
    const { server, allTools } = await import("../src/index.js");
    const s = server as any;
    expect(s._registeredTools).toBeDefined();
    const toolNames = Object.keys(s._registeredTools);

    // Count matches the registry (count is derived, not hardcoded).
    expect(toolNames.length).toBe(allTools.length);

    // No duplicate tool names.
    expect(new Set(toolNames).size).toBe(toolNames.length);

    // All original 21 tools are still present (backward compatibility).
    for (const n of ORIGINAL_TOOLS) {
      expect(toolNames).toContain(n);
    }

    // The expansion actually added tools.
    expect(toolNames.length).toBeGreaterThan(ORIGINAL_TOOLS.length);
  });
});
