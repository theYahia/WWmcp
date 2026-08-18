import { z } from "zod";
import { kaspiGet } from "../client.js";
import type { KaspiJsonApiResponse, KaspiOrder } from "../types.js";

export const getOrdersSchema = z.object({
  state: z.enum([
    "NEW", "SIGN_REQUIRED", "PICKUP",
    "DELIVERY", "KASPIDELIVERY", "ARCHIVE",
    "COMPLETED", "CANCELLED", "RETURNED",
  ]).optional().describe("Фильтр по статусу заказа"),
  page_number: z.number().int().min(0).default(0).describe("Номер страницы (от 0)"),
  page_size: z.number().int().min(1).max(100).default(20).describe("Размер страницы"),
  creation_date_from: z.string().optional().describe("Дата создания от (YYYY-MM-DD)"),
  creation_date_to: z.string().optional().describe("Дата создания до (YYYY-MM-DD)"),
});

export async function handleGetOrders(params: z.infer<typeof getOrdersSchema>): Promise<string> {
  const query: Record<string, string> = {
    "page[number]": String(params.page_number),
    "page[size]": String(params.page_size),
  };
  if (params.state) query["filter[orders][state]"] = params.state;
  if (params.creation_date_from) {
    query["filter[orders][creationDate][$ge]"] = new Date(params.creation_date_from).getTime().toString();
  }
  if (params.creation_date_to) {
    query["filter[orders][creationDate][$le]"] = new Date(params.creation_date_to).getTime().toString();
  }

  const result = (await kaspiGet("/orders", query)) as KaspiJsonApiResponse;

  const orders = result.data as KaspiOrder[];
  if (!Array.isArray(orders) || orders.length === 0) {
    return "Заказы не найдены.";
  }

  return JSON.stringify(orders.map(o => ({
    id: o.id,
    код: o.attributes.code,
    сумма: o.attributes.totalPrice,
    статус: o.attributes.status,
    состояние: o.attributes.state,
    оплата: o.attributes.paymentMode,
    доставка: o.attributes.deliveryMode,
    дата: o.attributes.creationDate,
    клиент: o.attributes.customer ? {
      имя: o.attributes.customer.name,
      телефон: o.attributes.customer.cellPhone,
    } : null,
    адрес: o.attributes.deliveryAddress?.formattedAddress,
  })), null, 2);
}
