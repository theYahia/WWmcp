import { z } from "zod";
import { DellinClient } from "../client.js";
import type { DellinTrackingResult } from "../types.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const trackSchema = z.object({
  doc_id: z.string().describe("Номер накладной или заказа Деловых Линий"),
});

export async function handleTrack(params: z.infer<typeof trackSchema>): Promise<string> {
  const result = (await getClient().post("/orders/statuses", {
    docIds: [params.doc_id],
  })) as DellinTrackingResult;

  const orders = result.data;
  if (!orders || orders.length === 0) {
    return `Заказ ${params.doc_id} не найден.`;
  }

  const order = orders[0];
  return JSON.stringify({
    номер_заказа: order.orderNumber,
    статус: order.stateName,
    код_статуса: order.state,
    дата_заказа: order.orderDate,
    город_отправления: order.senderCity,
    город_назначения: order.receiverCity,
    дата_отправки: order.derivalDate,
    дата_прибытия: order.arrivalDate,
    дата_доставки: order.deliveryDate,
  }, null, 2);
}
