/**
 * Webhook-style polling pseudo-subscriptions.
 *
 * IMPORTANT: As of 2026-04, Wildberries does NOT expose publish/subscribe
 * webhooks in the Seller API. Integrations poll endpoints like
 * `/api/v3/orders/new` and `/api/v3/stocks/{warehouseId}`. To give MCP clients
 * a workflow-friendly subscription primitive, this module implements an
 * in-memory subscription registry. Each subscription stores:
 *   - kind ("orders" | "stock_changes")
 *   - filter (date threshold or warehouseId / sku list)
 *   - lastSeen (cursor / timestamp / hash)
 *
 * `check_subscriptions` polls all registered subscriptions and returns the
 * diff since `lastSeen`. The agent can call it whenever it wants to "receive
 * events" — there is no push.
 *
 * Caveat: the registry is in-memory and is lost on process restart. For
 * durability, agents should persist subscription IDs and re-create them on
 * startup. This is documented in the tool description.
 */
import { createHash } from "node:crypto";
import type { WBClient } from "../client.js";

// ---------- In-memory subscription store ----------

export interface Subscription {
  id: string;
  kind: "orders" | "stock_changes";
  filter: {
    warehouseId?: number;
    skus?: string[];
  };
  lastSeen: string | null; // cursor for orders / state hash for stock
  createdAt: string;
}

const subscriptions = new Map<string, Subscription>();

let subscriptionCounter = 0;
function nextSubscriptionId(prefix: string): string {
  subscriptionCounter += 1;
  return `${prefix}-${Date.now()}-${subscriptionCounter}`;
}

// Test-only: reset state. Exported but not exposed as a tool.
export function _resetSubscriptions(): void {
  subscriptions.clear();
  subscriptionCounter = 0;
}

// ---------- Tool definitions ----------

export const webhooksToolDefinitions = {
  subscribe_to_orders: {
    description:
      "Create a polling subscription for new orders. Wildberries does not push webhooks, so this registers an in-memory subscription that check_subscriptions will poll on demand. Returns a subscription ID.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  subscribe_to_stock_changes: {
    description:
      "Create a polling subscription for stock changes at a specific warehouse. Wildberries does not push webhooks; check_subscriptions polls and reports SKUs whose stock differs from last poll. Returns a subscription ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        warehouseId: { type: "number", description: "Warehouse ID to monitor" },
        skus: {
          type: "array",
          items: { type: "string" },
          description: "Optional SKU/barcode filter (empty = all stocks at warehouse)",
        },
      },
      required: ["warehouseId"],
    },
  },
  list_subscriptions: {
    description: "List all active polling subscriptions in this server session.",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  unsubscribe: {
    description: "Remove a polling subscription by ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Subscription ID to remove" },
      },
      required: ["id"],
    },
  },
  check_subscriptions: {
    description:
      "Poll all active subscriptions and return events since the last check. For orders subscriptions, returns new orders since the last poll. For stock_changes subscriptions, returns SKUs with changed quantities. Use this in place of true webhook delivery.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: {
          type: "string",
          description: "Optional subscription ID — if omitted, checks all subscriptions",
        },
      },
    },
  },
} as const;

export type WebhooksToolName = keyof typeof webhooksToolDefinitions;

// ---------- Tool handlers ----------

interface NewOrder {
  id?: number;
  orderUid?: string;
  createdAt?: string;
}

interface StockItem {
  sku?: string;
  amount?: number;
}

function hashStocks(stocks: StockItem[]): string {
  const normalised = stocks
    .slice()
    .sort((a, b) => (a.sku ?? "").localeCompare(b.sku ?? ""))
    .map((s) => `${s.sku ?? ""}:${s.amount ?? 0}`)
    .join("|");
  return createHash("sha256").update(normalised).digest("hex").slice(0, 16);
}

async function checkOrdersSubscription(
  client: WBClient,
  sub: Subscription,
): Promise<{ newCount: number; events: NewOrder[] }> {
  const raw = await client.get<{ orders?: NewOrder[] }>("/api/v3/orders/new");
  const orders = raw.orders ?? [];
  const lastSeenIso = sub.lastSeen;
  const cutoff = lastSeenIso ? new Date(lastSeenIso).getTime() : 0;
  const events = orders.filter((o) => {
    const ts = o.createdAt ? new Date(o.createdAt).getTime() : Number.NaN;
    return Number.isFinite(ts) ? ts > cutoff : true;
  });
  // Update lastSeen to the newest event timestamp (or now if no createdAt)
  const newest = events.reduce<number>((max, o) => {
    const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
    return ts > max ? ts : max;
  }, cutoff);
  sub.lastSeen = newest > 0 ? new Date(newest).toISOString() : new Date().toISOString();
  return { newCount: events.length, events };
}

async function checkStockSubscription(
  client: WBClient,
  sub: Subscription,
): Promise<{ changed: boolean; stocks: StockItem[]; hash: string }> {
  const warehouseId = sub.filter.warehouseId!;
  const skus = sub.filter.skus ?? [];
  const raw = await client.post<{ stocks?: StockItem[] }>(
    `/api/v3/stocks/${warehouseId}`,
    { skus },
  );
  const stocks = raw.stocks ?? [];
  const hash = hashStocks(stocks);
  const changed = sub.lastSeen !== hash;
  sub.lastSeen = hash;
  return { changed, stocks, hash };
}

export async function handleWebhooksTool(
  client: WBClient,
  name: WebhooksToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "subscribe_to_orders": {
      const id = nextSubscriptionId("orders");
      const sub: Subscription = {
        id,
        kind: "orders",
        filter: {},
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      subscriptions.set(id, sub);
      return {
        id,
        kind: "orders",
        note: "Polling subscription created. WB does not push webhooks; call check_subscriptions to fetch new orders since last poll.",
      };
    }

    case "subscribe_to_stock_changes": {
      const id = nextSubscriptionId("stock");
      const sub: Subscription = {
        id,
        kind: "stock_changes",
        filter: {
          warehouseId: args.warehouseId as number,
          skus: (args.skus as string[] | undefined) ?? [],
        },
        lastSeen: null,
        createdAt: new Date().toISOString(),
      };
      subscriptions.set(id, sub);
      return {
        id,
        kind: "stock_changes",
        warehouseId: sub.filter.warehouseId,
        note: "Polling subscription created. WB does not push webhooks; call check_subscriptions to detect stock diffs.",
      };
    }

    case "list_subscriptions":
      return {
        count: subscriptions.size,
        subscriptions: Array.from(subscriptions.values()).map((s) => ({
          id: s.id,
          kind: s.kind,
          filter: s.filter,
          createdAt: s.createdAt,
          lastSeen: s.lastSeen,
        })),
      };

    case "unsubscribe": {
      const id = args.id as string;
      const existed = subscriptions.delete(id);
      return { id, removed: existed };
    }

    case "check_subscriptions": {
      const id = args.id as string | undefined;
      const targets = id
        ? subscriptions.has(id)
          ? [subscriptions.get(id)!]
          : []
        : Array.from(subscriptions.values());

      if (id && targets.length === 0) {
        return { error: `subscription not found: ${id}` };
      }

      const results: Array<Record<string, unknown>> = [];
      for (const sub of targets) {
        try {
          if (sub.kind === "orders") {
            const { newCount, events } = await checkOrdersSubscription(client, sub);
            results.push({
              id: sub.id,
              kind: sub.kind,
              newCount,
              events,
            });
          } else {
            const { changed, stocks, hash } = await checkStockSubscription(client, sub);
            results.push({
              id: sub.id,
              kind: sub.kind,
              warehouseId: sub.filter.warehouseId,
              changed,
              stateHash: hash,
              stocks: changed ? stocks : undefined,
            });
          }
        } catch (err) {
          results.push({
            id: sub.id,
            kind: sub.kind,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }
      return { polledAt: new Date().toISOString(), results };
    }

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown webhooks tool: ${String(_exhaustive)}`);
    }
  }
}
