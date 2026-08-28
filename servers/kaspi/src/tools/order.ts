import { z } from "zod";
import { kaspiGet } from "../client.js";
import type { KaspiJsonApiResponse, KaspiOrder } from "../types.js";

export const getOrderSchema = z.object({
  id: z.string().describe("ID заказа Kaspi"),
});

export async function handleGetOrder(params: z.infer<typeof getOrderSchema>): Promise<string> {
  // encodeURIComponent keeps a caller-supplied id from escaping the /orders/ path
  const result = (await kaspiGet(
    `/orders/${encodeURIComponent(params.id)}`,
  )) as KaspiJsonApiResponse;

  const order = result.data as KaspiOrder;
  if (!order || !order.attributes) {
    return `Заказ ${params.id} не найден.`;
  }

  return JSON.stringify({
    id: order.id,
    код: order.attributes.code,
    сумма: order.attributes.totalPrice,
    статус: order.attributes.status,
    состояние: order.attributes.state,
    оплата: order.attributes.paymentMode,
    доставка: order.attributes.deliveryMode,
    kaspi_доставка: order.attributes.isKaspiDelivery,
    стоимость_доставки: order.attributes.deliveryCostForSeller,
    подпись_требуется: order.attributes.signatureRequired,
    дата: order.attributes.creationDate,
    клиент: order.attributes.customer ? {
      id: order.attributes.customer.id,
      имя: order.attributes.customer.name,
      телефон: order.attributes.customer.cellPhone,
    } : null,
    адрес: order.attributes.deliveryAddress ? {
      адрес: order.attributes.deliveryAddress.formattedAddress,
      широта: order.attributes.deliveryAddress.latitude,
      долгота: order.attributes.deliveryAddress.longitude,
    } : null,
  }, null, 2);
}
