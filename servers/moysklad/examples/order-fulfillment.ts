/**
 * examples/order-fulfillment.ts
 *
 * Use case: pick all customer orders in state "Новый" (New), batch-transition
 * them to state "Подтверждён" (Confirmed), and (out of scope for this recipe)
 * trigger a downstream Demand doc per order. Shows how a daily fulfillment
 * worker can collapse 50+ MCP calls into 2.
 *
 * The recipe is split into three discrete phases so the LLM agent can pause
 * between them for human approval (production safety pattern).
 */

const NEW_STATE_NAME = "Новый";
const CONFIRMED_STATE_HREF =
  "https://api.moysklad.ru/api/remap/1.2/entity/customerorder/metadata/states/REPLACE_WITH_CONFIRMED_STATE_UUID";

/**
 * Phase 1 — Pick orders waiting for fulfillment.
 *
 * MCP call:
 *   get_orders { filter_state: "Новый", limit: 100, order: "created,asc" }
 *
 * Sort ascending so oldest orders are processed first (FIFO).
 */
function pickNewOrders() {
  return {
    tool: "get_orders",
    args: { filter_state: NEW_STATE_NAME, limit: 100, order: "created,asc" },
  };
}

/**
 * Phase 2 — Pause for human approval.
 *
 * The LLM should present a summary table (id, sum_rubles, agent name) and
 * wait for explicit "go ahead" before sending the batch transition. Do NOT
 * auto-confirm; financial state mutations are not reversible.
 */

/**
 * Phase 3 — Batch-transition approved orders.
 *
 * MCP call:
 *   batch_update_status {
 *     ids: [<approved order UUIDs>],
 *     state_href: CONFIRMED_STATE_HREF,
 *     concurrency: 5
 *   }
 *
 * The returned envelope's `failed_indexes` lists orders that 412'd (state
 * transition rejected — usually because the order is already in a downstream
 * state). Surface these to the human; do NOT auto-retry blindly.
 */
function batchConfirm(orderIds: string[]) {
  return {
    tool: "batch_update_status",
    args: { ids: orderIds, state_href: CONFIRMED_STATE_HREF, concurrency: 5 },
  };
}

export function orderFulfillmentRecipe(approvedOrderIds: string[]) {
  return {
    description:
      "Find all 'Новый' customer orders, surface them for human approval, then " +
      "batch-transition the approved subset to 'Подтверждён' in one MCP call.",
    phases: [
      { name: "pick", call: pickNewOrders() },
      { name: "approve", note: "Human-in-the-loop: present id/sum/agent, wait for go-ahead." },
      { name: "confirm", call: batchConfirm(approvedOrderIds) },
    ],
    notes: [
      "CONFIRMED_STATE_HREF must be looked up once via /entity/customerorder/metadata.",
      "MoySklad state transitions can be rejected (412) if the order is already downstream.",
      "For >100 orders, page through with offset and call get_orders multiple times.",
    ],
  };
}
