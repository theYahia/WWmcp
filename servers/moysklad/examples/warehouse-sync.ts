/**
 * examples/warehouse-sync.ts
 *
 * Use case: replenish under-stocked items in warehouse B from over-stocked
 * items in warehouse A. Reads stock per store, computes deltas, and creates
 * one customer order per shortfall (Internal Move docs are MoySklad-paid-plan
 * only — we emulate via cross-warehouse customer orders).
 *
 * Run via MCP tools — this file is a recipe for an LLM agent, not a standalone
 * script. The function bodies show the exact tool call sequence.
 *
 * Prereqs:
 *   - Two MoySklad warehouses (stores) exist with hrefs WAREHOUSE_A and WAREHOUSE_B
 *   - MOYSKLAD_TOKEN env var or login/password configured
 */

const WAREHOUSE_A_HREF = "https://api.moysklad.ru/api/remap/1.2/entity/store/REPLACE_WITH_WAREHOUSE_A_UUID";
const WAREHOUSE_B_HREF = "https://api.moysklad.ru/api/remap/1.2/entity/store/REPLACE_WITH_WAREHOUSE_B_UUID";
const ORGANIZATION_HREF = "https://api.moysklad.ru/api/remap/1.2/entity/organization/REPLACE_WITH_ORG_UUID";
const INTERNAL_AGENT_HREF = "https://api.moysklad.ru/api/remap/1.2/entity/counterparty/REPLACE_WITH_INTERNAL_AGENT_UUID";

/**
 * Step 1 — Read stock for both warehouses.
 *
 * MCP calls:
 *   - get_stock { group_by: "store", stock_mode: "positiveOnly", limit: 1000 }  ← warehouse A
 *   - get_stock { group_by: "store", stock_mode: "all",          limit: 1000 }  ← warehouse B
 *
 * Diff the two by product `code` or `article`. Products with stock_B <
 * stock_A * 0.2 (less than 20% of A's level) are flagged as shortfalls.
 */

interface ShortfallItem {
  product_href: string;
  quantity_to_move: number;
}

/**
 * Step 2 — Build a batch of "move" orders.
 *
 * For each shortfall, emit one position. MoySklad's customer-order entity
 * doesn't take a `store` field per line; instead the caller picks the source
 * warehouse via the order's top-level `store` meta (warehouse A) and the
 * receiving store via a downstream Demand document. For the simple replenish
 * case here we just stage the demand intent.
 */
function buildMoveOrder(shortfall: ShortfallItem) {
  return {
    organization_href: ORGANIZATION_HREF,
    agent_href: INTERNAL_AGENT_HREF,
    description: `Replenishment ${shortfall.product_href.split("/").pop()} A→B`,
    positions: [
      {
        assortment_href: shortfall.product_href,
        quantity: shortfall.quantity_to_move,
      },
    ],
  };
}

/**
 * Step 3 — Send all move orders in one batch_create_orders call.
 *
 * MCP call:
 *   batch_create_orders { orders: [...buildMoveOrder(s) for s in shortfalls], concurrency: 5 }
 *
 * The returned envelope has `failed_indexes` — feed those back into a retry
 * pass after a backoff. The 45 req / 3s rate limiter on the client means even
 * a 100-order batch finishes in ~7 seconds.
 */

export function warehouseSyncRecipe(shortfalls: ShortfallItem[]) {
  return {
    description:
      "Compare stock between warehouses A and B, batch-create replenishment customer " +
      "orders for products where B is under 20% of A.",
    mcp_calls: [
      { tool: "get_stock", args: { group_by: "store", stock_mode: "positiveOnly", limit: 1000 } },
      {
        tool: "batch_create_orders",
        args: { orders: shortfalls.map(buildMoveOrder), concurrency: 5 },
      },
    ],
    notes: [
      "Internal Move docs require a MoySklad paid plan. This recipe emulates via customer orders.",
      "WAREHOUSE_A_HREF / WAREHOUSE_B_HREF / ORGANIZATION_HREF must be looked up once (cache them).",
      "For shortfalls >100 items, split into multiple batch_create_orders calls.",
    ],
  };
}
