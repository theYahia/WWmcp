import { describe, it, expect, vi } from "vitest";
import { toolDefinitions, handleTool, type ToolName } from "../src/tools.js";
import {
  productsToolDefinitions,
  handleProductsTool,
} from "../src/tools/products.js";
import { stockToolDefinitions } from "../src/tools/stock.js";
import { ordersToolDefinitions } from "../src/tools/orders.js";
import { sellerAccountToolDefinitions } from "../src/tools/seller-account.js";
import { analyticsToolDefinitions } from "../src/tools/analytics.js";
import { webhooksToolDefinitions } from "../src/tools/webhooks.js";
import type { WBClient } from "../src/client.js";

function createMockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ ok: true }),
    post: vi.fn().mockResolvedValue({ ok: true }),
    put: vi.fn().mockResolvedValue({ ok: true }),
    patch: vi.fn().mockResolvedValue({ ok: true }),
    request: vi.fn().mockResolvedValue({ ok: true }),
  } as unknown as WBClient;
}

describe("Refactor smoke — v1.0 → v1.1.0 modular tools/", () => {
  it("aggregated toolDefinitions = union of all module slices", () => {
    const aggregated = new Set(Object.keys(toolDefinitions));
    const sumOfParts = new Set([
      ...Object.keys(productsToolDefinitions),
      ...Object.keys(stockToolDefinitions),
      ...Object.keys(ordersToolDefinitions),
      ...Object.keys(sellerAccountToolDefinitions),
      ...Object.keys(analyticsToolDefinitions),
      ...Object.keys(webhooksToolDefinitions),
    ]);
    expect(aggregated.size).toBe(sumOfParts.size);
    for (const name of sumOfParts) {
      expect(aggregated.has(name)).toBe(true);
    }
  });

  it("no duplicate tool names across modules", () => {
    const all = [
      ...Object.keys(productsToolDefinitions),
      ...Object.keys(stockToolDefinitions),
      ...Object.keys(ordersToolDefinitions),
      ...Object.keys(sellerAccountToolDefinitions),
      ...Object.keys(analyticsToolDefinitions),
      ...Object.keys(webhooksToolDefinitions),
    ];
    expect(new Set(all).size).toBe(all.length);
  });

  it("every tool has a description and inputSchema", () => {
    for (const [name, def] of Object.entries(toolDefinitions)) {
      expect(def.description, `${name}.description`).toBeTruthy();
      expect(def.inputSchema, `${name}.inputSchema`).toBeDefined();
      expect(def.inputSchema.type, `${name}.inputSchema.type`).toBe("object");
    }
  });

  it("handleTool dispatches to products module (smoke)", async () => {
    const client = createMockClient();
    await handleTool(client, "list_products", { limit: 10 });
    expect(client.post).toHaveBeenCalledWith(
      "/content/v2/get/cards/list",
      expect.objectContaining({ settings: expect.any(Object) }),
    );
  });

  it("handleTool dispatches to seller-account module (smoke)", async () => {
    const client = createMockClient();
    await handleTool(client, "get_commission_rates", { locale: "ru" });
    expect(client.get).toHaveBeenCalledWith("/api/v1/tariffs/commission", {
      locale: "ru",
    });
  });

  it("handleTool dispatches to orders module (smoke)", async () => {
    const client = createMockClient();
    await handleTool(client, "get_new_orders", {});
    expect(client.get).toHaveBeenCalledWith("/api/v3/orders/new");
  });

  it("module-direct handler works the same as aggregated handleTool", async () => {
    const c1 = createMockClient();
    const c2 = createMockClient();
    await handleProductsTool(c1, "get_product", { nmIDs: [1, 2] });
    await handleTool(c2, "get_product", { nmIDs: [1, 2] });
    expect(c1.post).toHaveBeenCalledWith("/content/v2/get/cards/detail", {
      nmIDs: [1, 2],
    });
    expect(c2.post).toHaveBeenCalledWith("/content/v2/get/cards/detail", {
      nmIDs: [1, 2],
    });
  });

  it("throws on unknown tool", async () => {
    const client = createMockClient();
    await expect(handleTool(client, "nonexistent" as ToolName, {})).rejects.toThrow(
      "Unknown tool",
    );
  });
});
