import { z } from "zod";
import { DellinClient } from "../client.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const getOrderHistorySchema = z.object({
  date_from: z.string().optional().describe("Дата начала периода (YYYY-MM-DD)"),
  date_to: z.string().optional().describe("Дата конца периода (YYYY-MM-DD)"),
  page: z.number().int().positive().default(1).describe("Номер страницы"),
});

export async function handleGetOrderHistory(params: z.infer<typeof getOrderHistorySchema>): Promise<string> {
  const body: Record<string, unknown> = { page: params.page };
  if (params.date_from) body.dateFrom = params.date_from;
  if (params.date_to) body.dateTo = params.date_to;

  const result = (await getClient().post("/orders", body)) as {
    data?: Array<{
      orderNumber: string;
      orderId: string;
      state: string;
      stateName: string;
      orderDate: string;
      senderCity?: string;
      receiverCity?: string;
    }>;
    metadata?: { total?: number; page?: number; pages?: number };
  };

  const orders = result.data;
  if (!orders || orders.length === 0) {
    return "Заказы не найдены.";
  }

  return JSON.stringify(
    {
      заказы: orders.map((o) => ({
        номер: o.orderNumber,
        статус: o.stateName,
        дата: o.orderDate,
        откуда: o.senderCity,
        куда: o.receiverCity,
      })),
      всего: result.metadata?.total,
      страница: result.metadata?.page,
      страниц: result.metadata?.pages,
    },
    null,
    2,
  );
}
