import { z } from "zod";
import { getClient } from "../client.js";
import { applyIdentifiers, NO_IDENTIFIER_MSG } from "../identify.js";
import { describeFailure, toOperationResponse } from "../response.js";

export const getCustomerSchema = z.object({
  operation: z
    .string()
    .default("Website.GetCustomerInfo")
    .describe(
      "Системное имя операции Mindbox для получения данных клиента (должно совпадать с настроенным в проекте)",
    ),
  email: z.string().email().optional().describe("Email клиента для поиска"),
  phone: z.string().trim().optional().describe("Телефон клиента для поиска"),
  external_id: z.string().trim().optional().describe("Внешний ID клиента"),
});

export async function handleGetCustomer(
  params: z.infer<typeof getCustomerSchema>,
): Promise<string> {
  const customer: Record<string, unknown> = {};
  if (!applyIdentifiers(customer, params)) {
    return NO_IDENTIFIER_MSG;
  }

  const result = toOperationResponse(await getClient().operation(params.operation, { customer }));

  if (result.status !== "Success" || !result.customer) {
    return `Клиент не найден. ${describeFailure(result)}`;
  }

  const c = result.customer;
  return JSON.stringify(
    {
      статус: result.status,
      клиент: {
        ids: c.ids,
        email: c.email,
        телефон: c.mobilePhone,
        имя: c.firstName,
        фамилия: c.lastName,
        дата_рождения: c.birthDate,
        пол: c.sex,
        регион: c.area?.name,
      },
      сегменты: result.customerSegmentations?.map((s) => ({
        сегментация: s.segmentation?.name,
        сегмент: s.segment?.name,
      })),
    },
    null,
    2,
  );
}
