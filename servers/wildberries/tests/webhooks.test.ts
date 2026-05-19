import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleTool } from "../src/tools.js";
import { _resetSubscriptions } from "../src/tools/webhooks.js";
import type { WBClient } from "../src/client.js";

function createMockClient(): WBClient {
  return {
    get: vi.fn().mockResolvedValue({ orders: [] }),
    post: vi.fn().mockResolvedValue({ stocks: [] }),
    put: vi.fn().mockResolvedValue({}),
    patch: vi.fn().mockResolvedValue({}),
    request: vi.fn().mockResolvedValue({}),
  } as unknown as WBClient;
}

describe("Webhooks (polling pseudo-subscriptions)", () => {
  beforeEach(() => {
    _resetSubscriptions();
  });

  it("subscribe → list → unsubscribe round-trip", async () => {
    const client = createMockClient();

    const sub1 = (await handleTool(client, "subscribe_to_orders", {})) as { id: string };
    expect(sub1.id).toMatch(/^orders-/);

    const sub2 = (await handleTool(client, "subscribe_to_stock_changes", {
      warehouseId: 42,
      skus: ["SKU-A", "SKU-B"],
    })) as { id: string };
    expect(sub2.id).toMatch(/^stock-/);

    const list = (await handleTool(client, "list_subscriptions", {})) as {
      count: number;
      subscriptions: Array<{ id: string; kind: string }>;
    };
    expect(list.count).toBe(2);

    const removed = (await handleTool(client, "unsubscribe", { id: sub1.id })) as {
      removed: boolean;
    };
    expect(removed.removed).toBe(true);

    const afterRemove = (await handleTool(client, "list_subscriptions", {})) as {
      count: number;
    };
    expect(afterRemove.count).toBe(1);
  });

  it("check_subscriptions polls orders subscription and reports new events", async () => {
    const client = createMockClient();
    // Subscribe first; lastSeen = now()
    const sub = (await handleTool(client, "subscribe_to_orders", {})) as { id: string };

    // Then mock a new order with a future timestamp
    const futureTs = new Date(Date.now() + 60_000).toISOString();
    (client.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      orders: [{ id: 1, orderUid: "wb-1", createdAt: futureTs }],
    });

    const result = (await handleTool(client, "check_subscriptions", { id: sub.id })) as {
      results: Array<{ id: string; kind: string; newCount: number }>;
    };
    expect(result.results).toHaveLength(1);
    expect(result.results[0].newCount).toBe(1);
  });

  it("check_subscriptions detects stock changes via state hash", async () => {
    const client = createMockClient();
    const sub = (await handleTool(client, "subscribe_to_stock_changes", {
      warehouseId: 1,
      skus: ["A"],
    })) as { id: string };

    // First poll: stocks=[{sku: A, amount: 10}] — initial state
    (client.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      stocks: [{ sku: "A", amount: 10 }],
    });
    const first = (await handleTool(client, "check_subscriptions", { id: sub.id })) as {
      results: Array<{ changed: boolean; stateHash: string }>;
    };
    expect(first.results[0].changed).toBe(true); // first poll always changes (vs null)

    // Second poll: same state → not changed
    (client.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      stocks: [{ sku: "A", amount: 10 }],
    });
    const second = (await handleTool(client, "check_subscriptions", { id: sub.id })) as {
      results: Array<{ changed: boolean }>;
    };
    expect(second.results[0].changed).toBe(false);

    // Third poll: stock differs → changed
    (client.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      stocks: [{ sku: "A", amount: 11 }],
    });
    const third = (await handleTool(client, "check_subscriptions", { id: sub.id })) as {
      results: Array<{ changed: boolean; stocks?: unknown[] }>;
    };
    expect(third.results[0].changed).toBe(true);
    expect(third.results[0].stocks).toBeDefined();
  });

  it("check_subscriptions returns error for missing id", async () => {
    const client = createMockClient();
    const result = (await handleTool(client, "check_subscriptions", {
      id: "does-not-exist",
    })) as { error: string };
    expect(result.error).toContain("not found");
  });
});
