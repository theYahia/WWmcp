/**
 * Orders, sales, supplies, and feedbacks tools.
 *
 * Endpoints:
 *   GET   /api/v3/orders            — orders list (paginated)
 *   GET   /api/v3/orders/new        — new (unprocessed) orders
 *   GET   /api/v1/supplier/sales    — sales report
 *   GET   /api/v3/supplies          — FBS supplies list
 *   POST  /api/v3/supplies          — create FBS supply
 *   GET   /api/v1/feedbacks         — feedbacks (reviews)
 *   PATCH /api/v1/feedbacks         — reply to a feedback
 */
import type { WBClient } from "../client.js";

export const ordersToolDefinitions = {
  get_orders: {
    description: "Get orders list with filters",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Number of orders (max 1000)" },
        next: { type: "number", description: "Pagination cursor" },
        dateFrom: { type: "string", description: "Date from (RFC3339, e.g. 2024-01-01T00:00:00Z)" },
        dateTo: { type: "string", description: "Date to (RFC3339)" },
      },
    },
  },
  get_new_orders: {
    description: "Get new (unprocessed) orders",
    inputSchema: {
      type: "object" as const,
      properties: {},
    },
  },
  get_sales: {
    description: "Get sales report",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Date from (RFC3339)" },
        dateTo: { type: "string", description: "Date to (RFC3339)" },
        flag: { type: "number", description: "0 = all, 1 = only new since last request" },
      },
      required: ["dateFrom"],
    },
  },
  get_supply: {
    description: "Get supply (delivery) details",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", description: "Number of supplies" },
        next: { type: "number", description: "Pagination cursor" },
      },
    },
  },
  create_supply: {
    description: "Create a new supply (delivery)",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Supply name" },
      },
      required: ["name"],
    },
  },
  get_feedbacks: {
    description: "Get product feedbacks (reviews)",
    inputSchema: {
      type: "object" as const,
      properties: {
        isAnswered: { type: "boolean", description: "Filter by answered status" },
        take: { type: "number", description: "Number of feedbacks to return" },
        skip: { type: "number", description: "Number of feedbacks to skip" },
        order: { type: "string", description: "Sort order: dateAsc or dateDesc" },
      },
    },
  },
  reply_feedback: {
    description: "Post a reply to a customer review on Wildberries",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Feedback ID" },
        text: { type: "string", description: "Reply text" },
      },
      required: ["id", "text"],
    },
  },
} as const;

export type OrdersToolName = keyof typeof ordersToolDefinitions;

export async function handleOrdersTool(
  client: WBClient,
  name: OrdersToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case "get_orders": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.next) params.next = String(args.next);
      if (args.dateFrom) params.dateFrom = String(args.dateFrom);
      if (args.dateTo) params.dateTo = String(args.dateTo);
      return client.get("/api/v3/orders", params);
    }

    case "get_new_orders":
      return client.get("/api/v3/orders/new");

    case "get_sales": {
      const params: Record<string, string> = { dateFrom: args.dateFrom as string };
      if (args.dateTo) params.dateTo = String(args.dateTo);
      if (args.flag !== undefined) params.flag = String(args.flag);
      return client.get("/api/v1/supplier/sales", params);
    }

    case "get_supply": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.next) params.next = String(args.next);
      return client.get("/api/v3/supplies", params);
    }

    case "create_supply":
      return client.post("/api/v3/supplies", { name: args.name });

    case "get_feedbacks": {
      const params: Record<string, string> = {};
      if (args.isAnswered !== undefined) params.isAnswered = String(args.isAnswered);
      if (args.take) params.take = String(args.take);
      if (args.skip) params.skip = String(args.skip);
      if (args.order) params.order = String(args.order);
      return client.get("/api/v1/feedbacks", params);
    }

    case "reply_feedback":
      return client.patch("/api/v1/feedbacks", {
        id: args.id,
        text: args.text,
      });

    default: {
      const _exhaustive: never = name;
      throw new Error(`Unknown orders tool: ${String(_exhaustive)}`);
    }
  }
}
