import { z } from "zod";
import { getClient } from "../client.js";
import { assertLocationTarget } from "../validation.js";
import type { CdekOrder } from "../types.js";

export const createOrderSchema = z.object({
  tariff_code: z.number().describe("Код тарифа СДЭК"),
  from_location: z.object({
    code: z.number().optional().describe("Код города отправителя"),
    postal_code: z.string().optional().describe("Почтовый индекс"),
    address: z.string().optional().describe("Адрес"),
  }).describe("Место отправления"),
  to_location: z.object({
    code: z.number().optional().describe("Код города получателя"),
    postal_code: z.string().optional().describe("Почтовый индекс"),
    address: z.string().optional().describe("Адрес"),
  }).describe("Место назначения"),
  recipient: z.object({
    name: z.string().describe("ФИО получателя"),
    phones: z.array(z.object({
      number: z.string().describe("Номер телефона"),
    })).min(1).describe("Телефоны получателя"),
    email: z.string().email().optional().describe("Email получателя"),
  }).describe("Данные получателя"),
  packages: z.array(z.object({
    number: z.string().describe("Номер места"),
    weight: z.number().positive().describe("Вес в граммах"),
    length: z.number().positive().optional().describe("Длина в см"),
    width: z.number().positive().optional().describe("Ширина в см"),
    height: z.number().positive().optional().describe("Высота в см"),
    items: z.array(z.object({
      name: z.string().describe("Наименование товара"),
      ware_key: z.string().describe("Артикул"),
      payment: z.object({
        value: z.number().describe("Сумма наложенного платежа"),
      }).optional().describe("Наложенный платёж"),
      cost: z.number().describe("Объявленная стоимость"),
      weight: z.number().positive().describe("Вес товара в граммах"),
      amount: z.number().int().positive().describe("Количество"),
    })).optional().describe("Вложения (для международных обязательно)"),
  })).min(1).describe("Список мест"),
  comment: z.string().optional().describe("Комментарий к заказу"),
});

export const getOrderSchema = z.object({
  uuid: z.string().describe("UUID заказа СДЭК"),
});

export const deleteOrderSchema = z.object({
  uuid: z.string().describe("UUID заказа СДЭК для удаления"),
});

export const listOrdersSchema = z.object({
  date_invoice_from: z.string().optional()
    .describe("Дата начала периода (формат YYYY-MM-DDTHH:MM:SS±HH:MM)"),
  date_invoice_to: z.string().optional()
    .describe("Дата окончания периода"),
  im_number: z.string().optional()
    .describe("Номер заказа интернет-магазина"),
  cdek_number: z.string().optional()
    .describe("Накладная СДЭК"),
  size: z.number().min(1).max(1000).default(50)
    .describe("Кол-во записей (макс. 1000)"),
  page: z.number().min(0).default(0)
    .describe("Страница (0-based)"),
});

export async function handleListOrders(
  params: z.infer<typeof listOrdersSchema>
): Promise<string> {
  const query: Record<string, string> = {
    size: String(params.size),
    page: String(params.page),
  };
  if (params.date_invoice_from) query.date_invoice_from = params.date_invoice_from;
  if (params.date_invoice_to) query.date_invoice_to = params.date_invoice_to;
  if (params.im_number) query.im_number = params.im_number;
  if (params.cdek_number) query.cdek_number = params.cdek_number;

  const result = await getClient().get("/orders", query);
  return JSON.stringify(result, null, 2);
}

export async function handleCreateOrder(params: z.infer<typeof createOrderSchema>): Promise<string> {
  assertLocationTarget(params.from_location, "Место отправления");
  assertLocationTarget(params.to_location, "Место назначения");

  const result = (await getClient().post("/orders", params)) as CdekOrder;

  if (result.errors && result.errors.length > 0) {
    const msgs = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
    return `Ошибка создания заказа: ${msgs}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    cdek_number: result.entity?.cdek_number,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Заказ создан. Используйте get_order для проверки статуса.",
  }, null, 2);
}

export async function handleGetOrder(params: z.infer<typeof getOrderSchema>): Promise<string> {
  const result = (await getClient().get(`/orders/${params.uuid}`)) as CdekOrder;

  if (result.errors && result.errors.length > 0) {
    const msgs = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
    return `Ошибка: ${msgs}`;
  }

  const entity = result.entity;
  return JSON.stringify({
    uuid: entity?.uuid,
    номер_сдэк: entity?.cdek_number,
    статусы: entity?.statuses?.map(s => ({
      код: s.code,
      название: s.name,
      дата: s.date_time,
      город: s.city,
    })),
  }, null, 2);
}

export async function handleDeleteOrder(params: z.infer<typeof deleteOrderSchema>): Promise<string> {
  const result = (await getClient().delete(`/orders/${params.uuid}`)) as CdekOrder;

  if (result.errors && result.errors.length > 0) {
    const msgs = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
    return `Ошибка удаления заказа: ${msgs}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Заказ удалён.",
  }, null, 2);
}
