import { describe, it, expect, afterEach } from "vitest";
import { createMcpServer, toolCount } from "../src/index.js";

describe("MCP server", () => {
  it("creates without throwing and registers the full tool surface", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
    expect(toolCount()).toBeGreaterThan(30);
  });

  it("RETAILCRM_READONLY hides write/destructive tools", () => {
    const full = toolCount();
    process.env.RETAILCRM_READONLY = "1";
    try {
      const readonly = toolCount();
      expect(readonly).toBeLessThan(full);
      expect(() => createMcpServer()).not.toThrow();
    } finally {
      delete process.env.RETAILCRM_READONLY;
    }
    expect(toolCount()).toBe(full);
  });
});

describe("Tool schemas", () => {
  it("listOrdersSchema applies detail/page/limit defaults", async () => {
    const { listOrdersSchema } = await import("../src/tools/orders.js");
    const r = listOrdersSchema.parse({});
    expect(r.detail).toBe("summary");
    expect(r.page).toBe(1);
    expect(r.limit).toBe(20);
  });

  it("listOrdersSchema rejects limit > 100", async () => {
    const { listOrdersSchema } = await import("../src/tools/orders.js");
    expect(listOrdersSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("listOrdersSchema validates date format", async () => {
    const { listOrdersSchema } = await import("../src/tools/orders.js");
    expect(listOrdersSchema.safeParse({ filter_date_from: "2025/01/01" }).success).toBe(false);
    expect(listOrdersSchema.safeParse({ filter_date_from: "2025-01-01" }).success).toBe(true);
  });

  it("createOrderSchema requires items", async () => {
    const { createOrderSchema } = await import("../src/tools/orders.js");
    expect(createOrderSchema.safeParse({ first_name: "Test" }).success).toBe(false);
  });

  it("createOrderSchema accepts a valid order", async () => {
    const { createOrderSchema } = await import("../src/tools/orders.js");
    const r = createOrderSchema.safeParse({
      first_name: "Ivan",
      items: [{ product_name: "Widget", quantity: 2, initial_price: 100 }],
    });
    expect(r.success).toBe(true);
  });

  it("listCustomersSchema validates input", async () => {
    const { listCustomersSchema } = await import("../src/tools/customers.js");
    expect(listCustomersSchema.safeParse({ filter_email: "test@example.com" }).success).toBe(true);
    expect(listCustomersSchema.safeParse({ limit: 200 }).success).toBe(false);
  });

  it("listProductsSchema treats filter_active as a boolean", async () => {
    const { listProductsSchema } = await import("../src/tools/products.js");
    expect(listProductsSchema.safeParse({ filter_active: true }).success).toBe(true);
    expect(listProductsSchema.safeParse({ filter_active: "yes" }).success).toBe(false);
  });

  it("getOrdersSummarySchema requires a date range", async () => {
    const { getOrdersSummarySchema } = await import("../src/tools/analytics.js");
    expect(getOrdersSummarySchema.safeParse({}).success).toBe(false);
    expect(getOrdersSummarySchema.safeParse({ date_from: "2025-01-01", date_to: "2025-01-31" }).success).toBe(true);
  });

  it("storeInventoriesSchema accepts empty input with defaults", async () => {
    const { storeInventoriesSchema } = await import("../src/tools/inventories.js");
    const r = storeInventoriesSchema.parse({});
    expect(r.page).toBe(1);
    expect(r.limit).toBe(20);
  });
});

describe("Client env validation", () => {
  const savedDomain = process.env.RETAILCRM_DOMAIN;
  const savedUrl = process.env.RETAILCRM_URL;
  const savedKey = process.env.RETAILCRM_API_KEY;

  afterEach(() => {
    if (savedDomain) process.env.RETAILCRM_DOMAIN = savedDomain; else delete process.env.RETAILCRM_DOMAIN;
    if (savedUrl) process.env.RETAILCRM_URL = savedUrl; else delete process.env.RETAILCRM_URL;
    if (savedKey) process.env.RETAILCRM_API_KEY = savedKey; else delete process.env.RETAILCRM_API_KEY;
  });

  it("throws when RETAILCRM_API_KEY is not set", async () => {
    process.env.RETAILCRM_DOMAIN = "test.retailcrm.ru";
    delete process.env.RETAILCRM_API_KEY;
    const { retailCrmGet } = await import("../src/client.js");
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_API_KEY");
  });

  it("throws when RETAILCRM_DOMAIN is not set", async () => {
    delete process.env.RETAILCRM_DOMAIN;
    delete process.env.RETAILCRM_URL;
    process.env.RETAILCRM_API_KEY = "test-key";
    const { retailCrmGet } = await import("../src/client.js");
    await expect(retailCrmGet("/orders")).rejects.toThrow("RETAILCRM_DOMAIN");
  });
});
