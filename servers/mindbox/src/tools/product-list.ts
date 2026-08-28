import { z } from "zod";
import { getClient } from "../client.js";
import { describeFailure, isSuccess, toOperationResponse } from "../response.js";

export const getProductListSchema = z.object({
  operation: z
    .string()
    .default("Website.GetProductList")
    .describe(
      "Системное имя операции Mindbox для получения списка товаров (должно совпадать с настроенным в проекте)",
    ),
  page: z.number().int().positive().optional().default(1).describe("Номер страницы"),
  page_size: z
    .number()
    .int()
    .positive()
    .max(1000)
    .optional()
    .default(20)
    .describe("Размер страницы"),
});

export async function handleGetProductList(
  params: z.infer<typeof getProductListSchema>,
): Promise<string> {
  const result = toOperationResponse(
    await getClient().operation(params.operation, {
      pageNumber: params.page,
      itemsPerPage: params.page_size,
    }),
  );

  if (!isSuccess(result)) {
    return `Ошибка получения списка товаров. ${describeFailure(result)}`;
  }

  const products = result.products ?? result.productList;

  // Имя поля со списком товаров настраивается per-operation. Если не нашли —
  // не выдаём молча пустой список (это маскировало бы дрейф формы ответа),
  // а возвращаем диагностику с фактическими ключами ответа.
  if (products === undefined) {
    const keys = Object.keys(result);
    return JSON.stringify(
      {
        статус: result.status,
        предупреждение:
          "Поле со списком товаров (products/productList) не найдено в ответе. Проверьте конфигурацию операции в Mindbox.",
        ключи_ответа: keys,
      },
      null,
      2,
    );
  }

  return JSON.stringify(
    {
      статус: result.status,
      товары: products,
      общее_количество: result.totalCount,
    },
    null,
    2,
  );
}
