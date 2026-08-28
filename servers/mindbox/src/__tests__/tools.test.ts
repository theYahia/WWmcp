import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Set env before importing modules
process.env.MINDBOX_API_KEY = "test-secret-key";
process.env.MINDBOX_ENDPOINT_ID = "test-endpoint";

interface MockResponseOptions {
  status?: number;
  retryAfter?: string | null;
}

function mockMindboxResponse(data: Record<string, unknown>) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
}

function mockMindboxError(status: number, body: string, opts: MockResponseOptions = {}) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    headers: {
      get: (k: string) => (k.toLowerCase() === "retry-after" ? (opts.retryAfter ?? null) : null),
    },
    text: async () => body,
  });
}

describe("MindboxClient", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("should POST to /v3/operations/sync with endpointId, operation and transactionId", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient();

    mockMindboxResponse({ status: "Success" });
    await client.operation("Test.Op", { foo: "bar" });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("api.mindbox.ru/v3/operations/sync");
    expect(url).toContain("endpointId=test-endpoint");
    expect(url).toContain("operation=Test.Op");
    expect(url).toContain("transactionId=");
    expect(opts.headers["Authorization"]).toBe('Mindbox secretKey="test-secret-key"');
    expect(opts.headers["Content-Type"]).toContain("application/json");
  });

  it("should use /v3/operations/async when mode=async", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient();

    mockMindboxResponse({ status: "Success" });
    await client.operation("Test.Op", {}, { mode: "async" });

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("/v3/operations/async");
  });

  it("should throw on non-retryable HTTP error (401)", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient("k", "e", { maxRetries: 0, retryBaseMs: 0 });

    mockMindboxError(401, "Unauthorized");
    await expect(client.operation("Test.Op", {})).rejects.toThrow("Mindbox HTTP 401");
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("should throw on InternalServerError status in response", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient();

    mockMindboxResponse({ status: "InternalServerError", errorMessage: "Something broke" });
    await expect(client.operation("Test.Op", {})).rejects.toThrow("Mindbox:");
  });

  it("should retry on 429 and reuse the same transactionId (idempotency)", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient("k", "e", { maxRetries: 2, retryBaseMs: 0 });

    mockMindboxError(429, "Too Many Requests", { retryAfter: "0" });
    mockMindboxResponse({ status: "Success" });

    const result = await client.operation("Test.Op", {});
    expect((result as { status: string }).status).toBe("Success");
    expect(mockFetch).toHaveBeenCalledTimes(2);

    const url1 = mockFetch.mock.calls[0][0] as string;
    const url2 = mockFetch.mock.calls[1][0] as string;
    const tx = (u: string) => new URL(u).searchParams.get("transactionId");
    expect(tx(url1)).toBeTruthy();
    expect(tx(url1)).toBe(tx(url2));
  });

  it("should surface timeout/abort as a friendly error after retries", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient("k", "e", { maxRetries: 0, retryBaseMs: 0 });

    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));
    await expect(client.operation("Test.Op", {})).rejects.toThrow("таймаут");
  });
});

describe("lazy client (no crash on import / discovery)", () => {
  it("tool modules import WITHOUT credentials and do not throw at import time", async () => {
    vi.resetModules();
    const saved = { ...process.env };
    delete process.env.MINDBOX_API_KEY;
    delete process.env.MINDBOX_SECRET_KEY;
    delete process.env.MINDBOX_ENDPOINT_ID;

    await expect(import("../tools/customer.js")).resolves.toBeDefined();
    await expect(import("../tools/run-operation.js")).resolves.toBeDefined();

    Object.assign(process.env, saved);
    vi.resetModules();
  });

  it("getClient throws a clear error when credentials are missing", async () => {
    vi.resetModules();
    const saved = { ...process.env };
    delete process.env.MINDBOX_API_KEY;
    delete process.env.MINDBOX_SECRET_KEY;
    delete process.env.MINDBOX_ENDPOINT_ID;

    const { getClient, resetClient } = await import("../client.js");
    resetClient();
    expect(() => getClient()).toThrow("MINDBOX_API_KEY");

    Object.assign(process.env, saved);
    resetClient();
    vi.resetModules();
  });
});

describe("get_customer handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should return customer data on success", async () => {
    const { handleGetCustomer } = await import("../tools/customer.js");

    mockMindboxResponse({
      status: "Success",
      customer: {
        email: "test@example.com",
        firstName: "Иван",
        lastName: "Петров",
        mobilePhone: "+79001234567",
      },
      customerSegmentations: [{ segmentation: { name: "VIP" }, segment: { name: "Gold" } }],
    });

    const result = await handleGetCustomer({
      operation: "Website.GetCustomerInfo",
      email: "test@example.com",
    });
    const parsed = JSON.parse(result);

    expect(parsed.статус).toBe("Success");
    expect(parsed.клиент.email).toBe("test@example.com");
    expect(parsed.клиент.имя).toBe("Иван");
    expect(parsed.сегменты).toHaveLength(1);
    expect(parsed.сегменты[0].сегмент).toBe("Gold");
  });

  it("should require at least one identifier", async () => {
    const { handleGetCustomer } = await import("../tools/customer.js");
    const result = await handleGetCustomer({ operation: "Website.GetCustomerInfo" });
    expect(result).toContain("Укажите хотя бы один идентификатор");
  });

  it("schema rejects malformed email and accepts valid one", async () => {
    const { getCustomerSchema } = await import("../tools/customer.js");
    expect(getCustomerSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(getCustomerSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
  });
});

describe("create_order handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should send order data correctly", async () => {
    const { handleCreateOrder } = await import("../tools/order.js");

    mockMindboxResponse({
      status: "Success",
      order: { ids: { externalId: "ORD-1" }, totalPrice: 1000, discountedTotalPrice: 900 },
    });

    const result = await handleCreateOrder({
      operation: "Website.CreateOrder",
      customer_email: "test@example.com",
      order_id: "ORD-1",
      lines: [{ product_id: "P1", quantity: 2, price: 500 }],
      total_price: 1000,
    });
    const parsed = JSON.parse(result);

    expect(parsed.статус).toBe("Success");
    expect(parsed.заказ.сумма).toBe(1000);
  });

  it("should require at least one customer identifier", async () => {
    const { handleCreateOrder } = await import("../tools/order.js");
    const result = await handleCreateOrder({
      operation: "Website.CreateOrder",
      order_id: "ORD-2",
      lines: [{ product_id: "P1", quantity: 1, price: 10 }],
      total_price: 10,
    });
    expect(result).toContain("Укажите хотя бы один идентификатор");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("get_segments handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should return segments list", async () => {
    const { handleGetSegments } = await import("../tools/segments.js");

    mockMindboxResponse({
      status: "Success",
      customerSegmentations: [
        { segmentation: { name: "Лояльность" }, segment: { name: "VIP", customerCount: 150 } },
        {
          segmentation: { name: "Активность" },
          segment: { name: "Активный", customerCount: 5000 },
        },
      ],
    });

    const result = await handleGetSegments({
      operation: "Website.GetCustomerSegments",
      email: "test@example.com",
    });
    const parsed = JSON.parse(result);

    expect(parsed.сегменты).toHaveLength(2);
    expect(parsed.сегменты[0].количество_клиентов).toBe(150);
  });

  it("should handle no segments found", async () => {
    const { handleGetSegments } = await import("../tools/segments.js");

    mockMindboxResponse({ status: "Success", customerSegmentations: [] });
    const result = await handleGetSegments({
      operation: "Website.GetCustomerSegments",
      phone: "+79001234567",
    });
    expect(result).toContain("не найдены");
  });
});

describe("update_customer handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should send update data correctly", async () => {
    const { handleUpdateCustomer } = await import("../tools/update-customer.js");

    mockMindboxResponse({
      status: "Success",
      customer: { ids: { externalId: "C1" }, email: "updated@example.com", firstName: "Мария" },
    });

    const result = await handleUpdateCustomer({
      operation: "Website.UpdateCustomer",
      email: "updated@example.com",
      first_name: "Мария",
    });
    const parsed = JSON.parse(result);

    expect(parsed.статус).toBe("Success");
    expect(parsed.клиент.имя).toBe("Мария");
  });

  it("should require identifier", async () => {
    const { handleUpdateCustomer } = await import("../tools/update-customer.js");
    const result = await handleUpdateCustomer({ operation: "Website.UpdateCustomer" });
    expect(result).toContain("Укажите хотя бы один идентификатор");
  });
});

describe("run_operation handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should forward arbitrary operation", async () => {
    const { handleRunOperation } = await import("../tools/run-operation.js");

    mockMindboxResponse({ status: "Success", custom: "data" });
    const result = await handleRunOperation({
      operation: "Custom.Operation",
      body: { key: "value" },
      mode: "sync",
    });
    const parsed = JSON.parse(result);

    expect(parsed.status).toBe("Success");
    expect(parsed.custom).toBe("data");
  });

  it("is disabled when MINDBOX_ALLOW_RAW=0", async () => {
    process.env.MINDBOX_ALLOW_RAW = "0";
    const { handleRunOperation } = await import("../tools/run-operation.js");
    const result = await handleRunOperation({
      operation: "Custom.Operation",
      body: {},
      mode: "sync",
    });
    expect(result).toContain("отключён");
    expect(mockFetch).not.toHaveBeenCalled();
    delete process.env.MINDBOX_ALLOW_RAW;
  });
});

describe("get_product_list handler", () => {
  beforeEach(() => mockFetch.mockClear());

  it("should return product list", async () => {
    const { handleGetProductList } = await import("../tools/product-list.js");

    mockMindboxResponse({
      status: "Success",
      products: [{ name: "Товар 1" }, { name: "Товар 2" }],
      totalCount: 2,
    });

    const result = await handleGetProductList({
      operation: "Website.GetProductList",
      page: 1,
      page_size: 20,
    });
    const parsed = JSON.parse(result);

    expect(parsed.статус).toBe("Success");
    expect(parsed.товары).toHaveLength(2);
  });

  it("warns instead of silently returning [] when product field is absent", async () => {
    const { handleGetProductList } = await import("../tools/product-list.js");

    mockMindboxResponse({ status: "Success", somethingElse: true });
    const result = await handleGetProductList({
      operation: "Website.GetProductList",
      page: 1,
      page_size: 20,
    });
    const parsed = JSON.parse(result);

    expect(parsed.предупреждение).toBeDefined();
    expect(parsed.ключи_ответа).toContain("somethingElse");
  });
});

describe("env var compatibility", () => {
  it("should accept MINDBOX_API_KEY via constructor", async () => {
    const { MindboxClient } = await import("../client.js");
    const client = new MindboxClient("direct-key", "direct-endpoint");
    expect(client).toBeDefined();
  });
});
