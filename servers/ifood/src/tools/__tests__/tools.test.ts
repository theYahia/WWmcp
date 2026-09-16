import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Response mock helpers ───────────────────────────────────────────────────────
// ensureToken() reads .json(); request()/parseBody() reads .text() + .headers.get().
const ok = (status: number) => status >= 200 && status < 300;

function mockToken(token = "test-token-123") {
  return { ok: true, status: 200, json: async () => ({ access_token: token, expires_in: 3600 }) };
}
function mockJson(body: unknown, status = 200) {
  return {
    ok: ok(status),
    status,
    headers: new Map([["content-type", "application/json"]]),
    text: async () => JSON.stringify(body),
  };
}
function mockEmpty(status = 202) {
  return { ok: ok(status), status, headers: new Map<string, string>(), text: async () => "" };
}
function mockErr(status: number, text = "error") {
  return { ok: false, status, headers: new Map<string, string>(), text: async () => text };
}
const tokenCalls = () =>
  mockFetch.mock.calls.filter((c) => String(c[0]).includes("/oauth/token")).length;

describe("ifood-mcp tools", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.IFOOD_CLIENT_ID = "test-id";
    process.env.IFOOD_CLIENT_SECRET = "test-secret";
    delete process.env.IFOOD_MAX_ATTEMPTS;
    delete process.env.IFOOD_TIMEOUT_MS;
    delete process.env.IFOOD_BASE_URL;
  });

  // ── Happy path: representative tools across modules ────────────────────────────

  it("list_orders polls events", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockJson([{ id: "evt-1", code: "PLC" }]));
    const { handleListOrders } = await import("../list-orders.js");
    const parsed = JSON.parse(await handleListOrders({}));
    expect(parsed).toHaveLength(1);
    expect(String(mockFetch.mock.calls[1][0])).toContain("/order/v1.0/events:polling");
  });

  it("get_order returns detail", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockJson({ id: "ord-1", total: { orderAmount: 5000 } }));
    const { handleGetOrder } = await import("../get-order.js");
    expect(JSON.parse(await handleGetOrder({ order_id: "ord-1" })).id).toBe("ord-1");
  });

  it("confirm_order tolerates a 202 empty body (no throw, friendly message)", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockEmpty(202));
    const { handleConfirmOrder } = await import("../confirm-order.js");
    const result = await handleConfirmOrder({ order_id: "ord-1" });
    expect(result).toContain("202");
    expect(String(mockFetch.mock.calls[1][0])).toContain("/order/v1.0/orders/ord-1/confirm");
  });

  it("acknowledge_events posts an {id} array", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockEmpty(202));
    const { handleAcknowledgeEvents } = await import("../acknowledge-events.js");
    await handleAcknowledgeEvents({ event_ids: ["a", "b"] });
    const [url, init] = mockFetch.mock.calls[1];
    expect(String(url)).toContain("/order/v1.0/events/acknowledgment");
    expect(JSON.parse(init.body)).toEqual([{ id: "a" }, { id: "b" }]);
  });

  it("update_item_status PATCHes items/status with an enum", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockEmpty(202));
    const { handleUpdateItemStatus } = await import("../update-item-status.js");
    await handleUpdateItemStatus({ merchant_id: "m-1", item_id: "i-1", status: "UNAVAILABLE" });
    const [url, init] = mockFetch.mock.calls[1];
    expect(init.method).toBe("PATCH");
    expect(String(url)).toContain("/catalog/v2.0/merchants/m-1/items/status");
    expect(JSON.parse(init.body)).toEqual({ itemId: "i-1", status: "UNAVAILABLE" });
  });

  it("cancel_order sends best-guess single-field {reason: code} body", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockEmpty(202));
    const { handleCancelOrder } = await import("../cancel-order.js");
    await handleCancelOrder({ order_id: "ord-1", code: "503" });
    const [url, init] = mockFetch.mock.calls[1];
    expect(String(url)).toContain("/order/v1.0/orders/ord-1/requestCancellation");
    expect(JSON.parse(init.body)).toEqual({ reason: "503" });
  });

  it("list_merchants forwards pagination as query params", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockJson([{ id: "m-1", name: "My Restaurant" }]));
    const { handleListMerchants } = await import("../list-merchants.js");
    expect(JSON.parse(await handleListMerchants({ page: 2, size: 50 }))[0].name).toBe("My Restaurant");
    expect(String(mockFetch.mock.calls[1][0])).toContain("page=2");
    expect(String(mockFetch.mock.calls[1][0])).toContain("size=50");
  });

  it("get_merchant_status works", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockJson([{ state: "OPEN" }]));
    const { handleGetMerchantStatus } = await import("../get-merchant-status.js");
    expect(JSON.parse(await handleGetMerchantStatus({ merchant_id: "m-1" }))[0].state).toBe("OPEN");
  });

  // ── Shared-token regression (the singleton fix) ───────────────────────────────

  it("shares ONE OAuth token across multiple tools (singleton)", async () => {
    mockFetch.mockResolvedValueOnce(mockToken()); // single token fetch
    mockFetch.mockResolvedValueOnce(mockJson([{ id: "evt-1" }])); // list_orders data
    mockFetch.mockResolvedValueOnce(mockJson([{ id: "m-1" }])); // list_merchants data
    const { handleListOrders } = await import("../list-orders.js");
    const { handleListMerchants } = await import("../list-merchants.js");
    await handleListOrders({});
    await handleListMerchants({});
    expect(tokenCalls()).toBe(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  // ── Robustness ────────────────────────────────────────────────────────────────

  it("refreshes the token once on a data-request 401, then retries", async () => {
    mockFetch.mockResolvedValueOnce(mockToken("old")); // initial token
    mockFetch.mockResolvedValueOnce(mockErr(401, "expired")); // data → 401
    mockFetch.mockResolvedValueOnce(mockToken("new")); // re-auth
    mockFetch.mockResolvedValueOnce(mockJson({ id: "ord-1" })); // data retry → 200
    const { handleGetOrder } = await import("../get-order.js");
    expect(JSON.parse(await handleGetOrder({ order_id: "ord-1" })).id).toBe("ord-1");
    expect(tokenCalls()).toBe(2);
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("retries a 429 with backoff, then succeeds", async () => {
    vi.useFakeTimers();
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockErr(429, "slow down"));
    mockFetch.mockResolvedValueOnce(mockJson([{ id: "evt-1" }]));
    const { handleListOrders } = await import("../list-orders.js");
    const p = handleListOrders({});
    await vi.runAllTimersAsync();
    expect(JSON.parse(await p)).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(3);
    vi.useRealTimers();
  });

  it("surfaces a timeout (AbortError) when retries are exhausted", async () => {
    process.env.IFOOD_MAX_ATTEMPTS = "1";
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockRejectedValueOnce(new DOMException("aborted", "AbortError"));
    const { handleGetOrder } = await import("../get-order.js");
    await expect(handleGetOrder({ order_id: "ord-1" })).rejects.toThrow("iFood: request timeout");
  });

  it("returns cleanly on a 204 empty body (no events)", async () => {
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockEmpty(204));
    const { handleListOrders } = await import("../list-orders.js");
    expect(await handleListOrders({})).toContain("204");
  });

  // ── Error contract (LLM reads these strings) ──────────────────────────────────

  it("propagates a token error", async () => {
    mockFetch.mockResolvedValueOnce(mockErr(401, "Unauthorized"));
    const { handleListOrders } = await import("../list-orders.js");
    await expect(handleListOrders({})).rejects.toThrow("token error");
  });

  it("propagates an HTTP error with status + body", async () => {
    process.env.IFOOD_MAX_ATTEMPTS = "1";
    mockFetch.mockResolvedValueOnce(mockToken());
    mockFetch.mockResolvedValueOnce(mockErr(404, "not found"));
    const { handleGetOrder } = await import("../get-order.js");
    await expect(handleGetOrder({ order_id: "missing" })).rejects.toThrow("iFood HTTP 404: not found");
  });

  it("fails with a clear message when credentials are missing (no process crash at import)", async () => {
    delete process.env.IFOOD_CLIENT_ID;
    delete process.env.IFOOD_CLIENT_SECRET;
    // Importing must NOT throw (deferred validation); the error surfaces on first request.
    const { handleListOrders } = await import("../list-orders.js");
    await expect(handleListOrders({})).rejects.toThrow("IFOOD_CLIENT_ID and IFOOD_CLIENT_SECRET required");
  });

  afterEach(() => {
    vi.useRealTimers();
  });
});
