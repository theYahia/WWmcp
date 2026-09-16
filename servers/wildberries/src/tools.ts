/**
 * MCP tools for the Wildberries Seller API.
 *
 * Tools are declared as JSON Schema (converted to Zod at registration, see
 * schema.ts) and dispatched by `handleTool`. Every API call is routed to the
 * correct per-category host via `HOSTS` (see client.ts) — Wildberries splits
 * its API across content-api / marketplace-api / statistics-api / etc.
 */
import { HOSTS, LIMITER_KEYS, type WBClient } from "./client.js";

/**
 * Detailed realization report path. Wildberries deprecated v1 in favour of v5
 * (`/api/v5/supplier/reportDetailByPeriod`). A newer finance API
 * (`POST /api/finance/v1/sales-reports/...`) is the eventual successor — if v5
 * stops responding, migrate here. VERIFY against current WB docs with a live token.
 */
const REPORT_DETAIL_PATH = "/api/v5/supplier/reportDetailByPeriod";

// ---------- Tool definitions ----------

export const toolDefinitions = {
  // ----- Products & content -----
  list_products: {
    description: "List seller products (cards) with pagination and optional text search",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 100, description: "Number of cards to return (max 100)" },
        cursor: { type: "string", description: "Pagination cursor (updatedAt from previous response)" },
        textSearch: { type: "string", description: "Search text filter" },
      },
    },
  },
  get_product: {
    description: "Get detailed info for specific product cards by nm IDs",
    inputSchema: {
      type: "object" as const,
      properties: {
        nmIDs: {
          type: "array",
          items: { type: "integer" },
          minItems: 1,
          maxItems: 100,
          description: "Array of nomenclature IDs (max 100)",
        },
      },
      required: ["nmIDs"],
    },
  },
  update_prices: {
    description: "Update product prices (creates an async upload task)",
    inputSchema: {
      type: "object" as const,
      properties: {
        prices: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              nmID: { type: "integer", description: "Nomenclature ID" },
              price: { type: "integer", minimum: 0, description: "New price in rubles" },
            },
            required: ["nmID", "price"],
          },
          description: "Array of price updates",
        },
      },
      required: ["prices"],
    },
  },
  update_stocks: {
    description: "Update FBS product stocks at a specific warehouse",
    inputSchema: {
      type: "object" as const,
      properties: {
        warehouseId: { type: "integer", description: "Warehouse ID (use get_warehouses)" },
        stocks: {
          type: "array",
          minItems: 1,
          items: {
            type: "object",
            properties: {
              sku: { type: "string", description: "Barcode/SKU" },
              amount: { type: "integer", minimum: 0, description: "Stock quantity" },
            },
            required: ["sku", "amount"],
          },
          description: "Array of stock updates",
        },
      },
      required: ["warehouseId", "stocks"],
    },
  },
  get_stocks: {
    description: "Get current FBS stock levels for a specific warehouse",
    inputSchema: {
      type: "object" as const,
      properties: {
        warehouseId: { type: "integer", description: "Warehouse ID (use get_warehouses to get IDs)" },
        skus: {
          type: "array",
          items: { type: "string" },
          description: "Array of barcodes/SKUs to check (leave empty for all stocks)",
        },
      },
      required: ["warehouseId"],
    },
  },

  // ----- Orders & sales -----
  get_orders: {
    description: "Get FBS orders list with filters",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 1000, description: "Number of orders (max 1000)" },
        next: { type: "integer", description: "Pagination cursor" },
        dateFrom: { type: "string", description: "Date from (RFC3339, e.g. 2024-01-01T00:00:00Z)" },
        dateTo: { type: "string", description: "Date to (RFC3339)" },
      },
    },
  },
  get_new_orders: {
    description: "Get new (unprocessed) FBS orders",
    inputSchema: { type: "object" as const, properties: {} },
  },
  get_sales: {
    description:
      "Get the Wildberries sales report for a date range: sale IDs, prices, discounts and payouts",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Date from (RFC3339)" },
        dateTo: { type: "string", description: "Date to (RFC3339)" },
        flag: { type: "integer", minimum: 0, maximum: 1, description: "0 = all, 1 = only new since last request" },
      },
      required: ["dateFrom"],
    },
  },
  get_incomes: {
    description: "Get FBW supply incomes (deliveries to WB warehouses) since a date",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Date from (RFC3339)" },
      },
      required: ["dateFrom"],
    },
  },
  get_fbw_stocks: {
    description: "Get FBW stock levels (goods stored at WB warehouses) since a date",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Date from (RFC3339)" },
      },
      required: ["dateFrom"],
    },
  },

  // ----- Warehouses & supplies (FBS) -----
  get_warehouses: {
    description: "Get list of WB warehouses (offices)",
    inputSchema: { type: "object" as const, properties: {} },
  },
  get_supply: {
    description: "Get FBS supplies (deliveries) list with pagination",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 1000, description: "Number of supplies" },
        next: { type: "integer", description: "Pagination cursor" },
      },
    },
  },
  create_supply: {
    description: "Create a new FBS supply (delivery)",
    inputSchema: {
      type: "object" as const,
      properties: { name: { type: "string", description: "Supply name" } },
      required: ["name"],
    },
  },
  add_orders_to_supply: {
    description: "Attach one or more assembly orders to an FBS supply",
    inputSchema: {
      type: "object" as const,
      properties: {
        supplyId: { type: "string", description: "Supply ID (e.g. WB-GI-1234567)" },
        orderIds: {
          type: "array",
          items: { type: "integer" },
          minItems: 1,
          description: "Assembly order IDs to attach",
        },
      },
      required: ["supplyId", "orderIds"],
    },
  },
  deliver_supply: {
    description: "Close an FBS supply and send it to delivery (orders move to 'in delivery')",
    inputSchema: {
      type: "object" as const,
      properties: { supplyId: { type: "string", description: "Supply ID" } },
      required: ["supplyId"],
    },
  },
  get_supply_barcode: {
    description: "Get the QR barcode for an FBS supply (available after deliver_supply)",
    inputSchema: {
      type: "object" as const,
      properties: {
        supplyId: { type: "string", description: "Supply ID" },
        type: { type: "string", enum: ["svg", "zpl", "png"], description: "Barcode format (default svg)" },
      },
      required: ["supplyId"],
    },
  },

  // ----- Analytics & statistics -----
  get_statistics: {
    description: "Get detailed realization (sales) report by period",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
        limit: { type: "integer", minimum: 1, maximum: 100000, description: "Number of records" },
        rrdid: { type: "integer", description: "Pagination cursor (last rrd_id from previous response)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  get_abc_analysis: {
    description:
      "Compute ABC analysis of products by sales revenue (Pareto). A = products making up the top 80% of revenue, B = next 15%, C = bottom 5%. Identifies best-sellers and slow movers.",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339, e.g. 2025-01-01T00:00:00Z)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  get_funnel: {
    description: "Get the product sales funnel (views, add-to-cart, orders, buyouts) by period",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (YYYY-MM-DD)" },
        dateTo: { type: "string", description: "End date (YYYY-MM-DD)" },
        page: { type: "integer", minimum: 1, description: "Page number (default 1)" },
        nmIDs: { type: "array", items: { type: "integer" }, description: "Filter by nomenclature IDs" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },
  get_paid_storage: {
    description: "Get the paid storage cost report for a period (async report: created, polled, then downloaded)",
    inputSchema: {
      type: "object" as const,
      properties: {
        dateFrom: { type: "string", description: "Start date (RFC3339)" },
        dateTo: { type: "string", description: "End date (RFC3339)" },
      },
      required: ["dateFrom", "dateTo"],
    },
  },

  // ----- Pricing reference -----
  get_commission: {
    description: "Get WB commission rates per category (subject)",
    inputSchema: {
      type: "object" as const,
      properties: {
        locale: { type: "string", enum: ["ru", "en", "zh"], description: "Locale for category names (default ru)" },
      },
    },
  },
  get_tariffs: {
    description: "Get WB box (logistics & storage) tariffs for a date",
    inputSchema: {
      type: "object" as const,
      properties: {
        date: { type: "string", description: "Date (YYYY-MM-DD, default today)" },
      },
    },
  },

  // ----- Feedbacks & questions -----
  get_feedbacks: {
    description: "Get product feedbacks (reviews)",
    inputSchema: {
      type: "object" as const,
      properties: {
        isAnswered: { type: "boolean", description: "Filter by answered status" },
        take: { type: "integer", minimum: 1, maximum: 5000, description: "Number of feedbacks to return" },
        skip: { type: "integer", minimum: 0, description: "Number of feedbacks to skip" },
        order: { type: "string", enum: ["dateAsc", "dateDesc"], description: "Sort order" },
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
  get_questions: {
    description: "Get customer questions about products",
    inputSchema: {
      type: "object" as const,
      properties: {
        isAnswered: { type: "boolean", description: "Filter by answered status (default false)" },
        take: { type: "integer", minimum: 1, maximum: 10000, description: "Number to return (default 100)" },
        skip: { type: "integer", minimum: 0, description: "Number to skip (default 0)" },
        order: { type: "string", enum: ["dateAsc", "dateDesc"], description: "Sort order" },
      },
    },
  },
  reply_question: {
    description: "Post an answer to a customer question on Wildberries",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string", description: "Question ID" },
        text: { type: "string", description: "Answer text" },
        state: { type: "string", description: "Answer state (default 'wbRu' = publish). VERIFY accepted values." },
      },
      required: ["id", "text"],
    },
  },

  // ----- Returns -----
  get_returns: {
    description: "Get buyer return claims (requests to return goods)",
    inputSchema: {
      type: "object" as const,
      properties: {
        isArchive: { type: "boolean", description: "Get archived claims instead of active (default false)" },
        limit: { type: "integer", minimum: 1, maximum: 200, description: "Number of claims (max 200)" },
        offset: { type: "integer", minimum: 0, description: "Offset for pagination" },
        nmId: { type: "integer", description: "Filter by nomenclature ID" },
      },
    },
  },

  // ----- Advertising -----
  get_balance: {
    description: "Get advertising account balance (balance, net account, bonuses)",
    inputSchema: { type: "object" as const, properties: {} },
  },
  list_campaigns: {
    description: "List advertising campaigns grouped by type and status (counts + IDs)",
    inputSchema: { type: "object" as const, properties: {} },
  },
  get_campaign_stats: {
    description: "Get full advertising statistics for one or more campaigns over a date range",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignIds: {
          type: "array",
          items: { type: "integer" },
          minItems: 1,
          description: "Advertising campaign IDs",
        },
        dateFrom: { type: "string", description: "Start date (YYYY-MM-DD)" },
        dateTo: { type: "string", description: "End date (YYYY-MM-DD)" },
      },
      required: ["campaignIds", "dateFrom", "dateTo"],
    },
  },
} as const;

// ---------- Tool handlers ----------

export type ToolName = keyof typeof toolDefinitions;

export async function handleTool(
  client: WBClient,
  name: ToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    // ----- Products & content -----
    case "list_products": {
      const limit = (args.limit as number) ?? 100;
      const body: Record<string, unknown> = {
        settings: {
          cursor: args.cursor ? { limit, updatedAt: args.cursor } : { limit },
          filter: args.textSearch ? { withPhoto: -1, textSearch: args.textSearch } : { withPhoto: -1 },
        },
      };
      return client.post(HOSTS.content, "/content/v2/get/cards/list", body);
    }

    case "get_product":
      return client.post(HOSTS.content, "/content/v2/get/cards/detail", { nmIDs: args.nmIDs });

    case "update_prices":
      return client.post(HOSTS.prices, "/api/v2/upload/task", { data: args.prices });

    case "update_stocks": {
      const warehouseId = args.warehouseId as number;
      return client.put(HOSTS.marketplace, `/api/v3/stocks/${warehouseId}`, { stocks: args.stocks });
    }

    case "get_stocks": {
      const warehouseId = args.warehouseId as number;
      const skus = (args.skus as string[] | undefined) ?? [];
      // Empty array returns all stocks for the warehouse
      return client.post(HOSTS.marketplace, `/api/v3/stocks/${warehouseId}`, { skus });
    }

    // ----- Orders & sales -----
    case "get_orders": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.next) params.next = String(args.next);
      if (args.dateFrom) params.dateFrom = String(args.dateFrom);
      if (args.dateTo) params.dateTo = String(args.dateTo);
      return client.get(HOSTS.marketplace, "/api/v3/orders", params);
    }

    case "get_new_orders":
      return client.get(HOSTS.marketplace, "/api/v3/orders/new");

    case "get_sales": {
      const params: Record<string, string> = { dateFrom: args.dateFrom as string };
      if (args.dateTo) params.dateTo = String(args.dateTo);
      if (args.flag !== undefined) params.flag = String(args.flag);
      return client.get(HOSTS.statistics, "/api/v1/supplier/sales", params);
    }

    case "get_incomes":
      return client.get(HOSTS.statistics, "/api/v1/supplier/incomes", { dateFrom: args.dateFrom as string });

    case "get_fbw_stocks":
      return client.get(HOSTS.statistics, "/api/v1/supplier/stocks", { dateFrom: args.dateFrom as string });

    // ----- Warehouses & supplies (FBS) -----
    case "get_warehouses":
      return client.get(HOSTS.marketplace, "/api/v3/offices");

    case "get_supply": {
      const params: Record<string, string> = {};
      if (args.limit) params.limit = String(args.limit);
      if (args.next) params.next = String(args.next);
      return client.get(HOSTS.marketplace, "/api/v3/supplies", params);
    }

    case "create_supply":
      return client.post(HOSTS.marketplace, "/api/v3/supplies", { name: args.name });

    case "add_orders_to_supply": {
      const supplyId = encodeURIComponent(args.supplyId as string);
      const orderIds = args.orderIds as number[];
      // WB: one assembly order per PATCH call (returns 204). Loop sequentially.
      for (const orderId of orderIds) {
        await client.patch(HOSTS.marketplace, `/api/v3/supplies/${supplyId}/orders/${orderId}`);
      }
      return { supplyId: args.supplyId, added: orderIds };
    }

    case "deliver_supply": {
      const supplyId = encodeURIComponent(args.supplyId as string);
      await client.patch(HOSTS.marketplace, `/api/v3/supplies/${supplyId}/deliver`);
      return { supplyId: args.supplyId, delivered: true };
    }

    case "get_supply_barcode": {
      const supplyId = encodeURIComponent(args.supplyId as string);
      const type = (args.type as string) ?? "svg";
      // VERIFY: response is JSON { barcode, file(base64) } on current API.
      return client.get(HOSTS.marketplace, `/api/v3/supplies/${supplyId}/barcode`, { type });
    }

    // ----- Analytics & statistics -----
    case "get_statistics": {
      const params: Record<string, string> = {
        dateFrom: args.dateFrom as string,
        dateTo: args.dateTo as string,
      };
      if (args.limit) params.limit = String(args.limit);
      if (args.rrdid) params.rrdid = String(args.rrdid);
      return client.get(HOSTS.statistics, REPORT_DETAIL_PATH, params);
    }

    case "get_abc_analysis": {
      const params: Record<string, string> = {
        dateFrom: args.dateFrom as string,
        dateTo: args.dateTo as string,
        limit: "100000",
        rrdid: "0",
      };
      type Row = { nm_id: number; sa_name: string; retail_amount: number; quantity: number };
      const raw = await client.get<Row[] | { data?: Row[] }>(HOSTS.statistics, REPORT_DETAIL_PATH, params);
      // reportDetailByPeriod returns a top-level array; tolerate { data: [...] } too.
      const rows: Row[] = Array.isArray(raw) ? raw : raw?.data ?? [];

      const grouped = new Map<number, { name: string; revenue: number; orders: number }>();
      for (const row of rows) {
        const existing = grouped.get(row.nm_id);
        if (existing) {
          existing.revenue += row.retail_amount ?? 0;
          existing.orders += row.quantity ?? 0;
        } else {
          grouped.set(row.nm_id, {
            name: row.sa_name ?? String(row.nm_id),
            revenue: row.retail_amount ?? 0,
            orders: row.quantity ?? 0,
          });
        }
      }

      const items = Array.from(grouped.entries())
        .map(([nmId, v]) => ({ nmId, ...v }))
        .sort((a, b) => b.revenue - a.revenue);

      const totalRevenue = items.reduce((s, i) => s + i.revenue, 0);

      let cumulative = 0;
      const result = items.map((item) => {
        cumulative += item.revenue;
        const cumulativeShare = totalRevenue > 0 ? cumulative / totalRevenue : 0;
        const abcClass = cumulativeShare <= 0.8 ? "A" : cumulativeShare <= 0.95 ? "B" : "C";
        return {
          nmId: item.nmId,
          name: item.name,
          revenue: Math.round(item.revenue),
          orders: item.orders,
          revenueShare: totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 10000) / 100 : 0,
          class: abcClass,
        };
      });

      const summary = {
        A: result.filter((i) => i.class === "A").length,
        B: result.filter((i) => i.class === "B").length,
        C: result.filter((i) => i.class === "C").length,
        totalProducts: result.length,
        totalRevenue: Math.round(totalRevenue),
      };

      return { summary, items: result };
    }

    case "get_funnel": {
      // VERIFY body field names against WB analytics OpenAPI.
      const body: Record<string, unknown> = {
        period: { begin: args.dateFrom, end: args.dateTo },
        page: (args.page as number) ?? 1,
      };
      if (args.nmIDs) body.nmIDs = args.nmIDs;
      return client.post(HOSTS.analytics, "/api/v2/nm-report/detail", body);
    }

    case "get_paid_storage": {
      // Async report: create task -> poll status -> download.
      const create = await client.get<{ data?: { taskId?: string } }>(
        HOSTS.analytics,
        "/api/v1/paid_storage",
        { dateFrom: args.dateFrom as string, dateTo: args.dateTo as string },
        { limiterKey: LIMITER_KEYS.paidStorageCreate },
      );
      const taskId = create?.data?.taskId;
      if (!taskId) throw new Error("paid_storage: API did not return a taskId");
      const taskSeg = encodeURIComponent(taskId);

      // VERIFY: status string ("done") and download envelope shape.
      await client.pollUntil({
        fn: () =>
          client.get<{ data?: { status?: string } }>(
            HOSTS.analytics,
            `/api/v1/paid_storage/tasks/${taskSeg}/status`,
            undefined,
            { limiterKey: LIMITER_KEYS.paidStorageStatus },
          ),
        done: (r) => r?.data?.status === "done",
        intervalMs: 5000,
        timeoutMs: 120_000,
        label: `paid_storage ${taskId}`,
      });

      const report = await client.get(
        HOSTS.analytics,
        `/api/v1/paid_storage/tasks/${taskSeg}/download`,
        undefined,
        { limiterKey: LIMITER_KEYS.paidStorageDownload },
      );
      return { taskId, report };
    }

    // ----- Pricing reference -----
    case "get_commission": {
      const params: Record<string, string> = {};
      if (args.locale) params.locale = String(args.locale);
      return client.get(HOSTS.common, "/api/v1/tariffs/commission", params);
    }

    case "get_tariffs": {
      const date = (args.date as string) ?? new Date().toISOString().slice(0, 10);
      return client.get(HOSTS.common, "/api/v1/tariffs/box", { date });
    }

    // ----- Feedbacks & questions -----
    case "get_feedbacks": {
      const params: Record<string, string> = {};
      if (args.isAnswered !== undefined) params.isAnswered = String(args.isAnswered);
      if (args.take) params.take = String(args.take);
      if (args.skip !== undefined) params.skip = String(args.skip);
      if (args.order) params.order = String(args.order);
      return client.get(HOSTS.feedbacks, "/api/v1/feedbacks", params);
    }

    case "reply_feedback":
      return client.patch(HOSTS.feedbacks, "/api/v1/feedbacks", { id: args.id, text: args.text });

    case "get_questions": {
      const params: Record<string, string> = {
        isAnswered: String(args.isAnswered ?? false),
        take: String((args.take as number) ?? 100),
        skip: String((args.skip as number) ?? 0),
      };
      if (args.order) params.order = String(args.order);
      return client.get(HOSTS.feedbacks, "/api/v1/questions", params);
    }

    case "reply_question":
      // VERIFY: accepted `state` values for publishing an answer.
      return client.patch(HOSTS.feedbacks, "/api/v1/questions", {
        id: args.id,
        answer: { text: args.text },
        state: (args.state as string) ?? "wbRu",
      });

    // ----- Returns -----
    case "get_returns": {
      // VERIFY: claims query parameter names against returns-api OpenAPI.
      const params: Record<string, string> = { is_archive: String(args.isArchive ?? false) };
      if (args.limit !== undefined) params.limit = String(args.limit);
      if (args.offset !== undefined) params.offset = String(args.offset);
      if (args.nmId !== undefined) params.nmId = String(args.nmId);
      return client.get(HOSTS.returns, "/api/v1/claims", params);
    }

    // ----- Advertising -----
    case "get_balance":
      return client.get(HOSTS.advert, "/adv/v1/balance", undefined, {
        limiterKey: LIMITER_KEYS.advertBalance,
      });

    case "list_campaigns":
      // VERIFY: shape; may need POST /adv/v1/promotion/adverts for full list.
      return client.get(HOSTS.advert, "/adv/v1/promotion/count");

    case "get_campaign_stats": {
      // VERIFY: /adv/v2/fullstats body shape against advert-api OpenAPI.
      const body = (args.campaignIds as number[]).map((id) => ({
        id,
        interval: { begin: args.dateFrom, end: args.dateTo },
      }));
      return client.post(HOSTS.advert, "/adv/v2/fullstats", body);
    }

    default:
      throw new Error(`Unknown tool: ${name as string}`);
  }
}
