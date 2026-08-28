import { z } from "zod";
import { getClient } from "../client.js";
import { applyIdentifiers, NO_IDENTIFIER_MSG } from "../identify.js";
import { describeFailure, isSuccess, toOperationResponse } from "../response.js";

const orderLineSchema = z.object({
  product_id: z.string().describe("ID товара"),
  product_name: z.string().optional().describe("Название товара"),
  quantity: z.number().positive().describe("Количество"),
  price: z.number().describe("Цена за единицу"),
});

export const createOrderSchema = z.object({
  operation: z
    .string()
    .default("Website.CreateOrder")
    .describe(
      "Системное имя операции Mindbox для создания заказа (должно совпадать с настроенным в проекте)",
    ),
  customer_email: z.string().email().optional().describe("Email клиента"),
  customer_phone: z.string().trim().optional().describe("Телефон клиента"),
  customer_external_id: z.string().trim().optional().describe("Внешний ID клиента"),
  order_id: z.string().describe("ID заказа во внешней системе"),
  lines: z.array(orderLineSchema).min(1).describe("Строки заказа (товары)"),
  total_price: z.number().describe("Общая сумма заказа"),
});

export async function handleCreateOrder(
  params: z.infer<typeof createOrderSchema>,
): Promise<string> {
  const customer: Record<string, unknown> = {};
  const hasId = applyIdentifiers(customer, {
    email: params.customer_email,
    phone: params.customer_phone,
    external_id: params.customer_external_id,
  });
  if (!hasId) {
    return NO_IDENTIFIER_MSG;
  }

  const order = {
    ids: { externalId: params.order_id },
    lines: params.lines.map((l) => ({
      product: { ids: { externalId: l.product_id }, name: l.product_name },
      quantity: l.quantity,
      basePricePerItem: l.price,
    })),
    totalPrice: params.total_price,
  };

  const result = toOperationResponse(
    await getClient().operation(params.operation, {
      customer,
      order,
    }),
  );

  return JSON.stringify(
    {
      статус: result.status,
      заказ: result.order
        ? {
            ids: result.order.ids,
            сумма: result.order.totalPrice,
            сумма_со_скидкой: result.order.discountedTotalPrice,
          }
        : null,
      ошибка: isSuccess(result) ? undefined : describeFailure(result),
    },
    null,
    2,
  );
}
