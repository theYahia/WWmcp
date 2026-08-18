import { z } from "zod";
import { getClient } from "../client.js";
import { applyIdentifiers, NO_IDENTIFIER_MSG } from "../identify.js";
import { describeFailure, isSuccess, toOperationResponse } from "../response.js";

export const getSegmentsSchema = z.object({
  operation: z
    .string()
    .default("Website.GetCustomerSegments")
    .describe(
      "Системное имя операции Mindbox для получения сегментов клиента (должно совпадать с настроенным в проекте)",
    ),
  email: z.string().email().optional().describe("Email клиента"),
  phone: z.string().trim().optional().describe("Телефон клиента"),
  external_id: z.string().trim().optional().describe("Внешний ID клиента"),
});

export async function handleGetSegments(
  params: z.infer<typeof getSegmentsSchema>,
): Promise<string> {
  const customer: Record<string, unknown> = {};
  if (!applyIdentifiers(customer, params)) {
    return NO_IDENTIFIER_MSG;
  }

  const result = toOperationResponse(await getClient().operation(params.operation, { customer }));

  if (!isSuccess(result)) {
    return `Ошибка получения сегментов. ${describeFailure(result)}`;
  }

  const segments = result.customerSegmentations ?? [];

  if (segments.length === 0) {
    return "Сегменты для данного клиента не найдены.";
  }

  return JSON.stringify(
    {
      статус: result.status,
      сегменты: segments.map((s) => ({
        сегментация: s.segmentation?.name,
        сегмент: s.segment?.name,
        количество_клиентов: s.segment?.customerCount,
      })),
    },
    null,
    2,
  );
}
