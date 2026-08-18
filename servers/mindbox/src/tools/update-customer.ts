import { z } from "zod";
import { getClient } from "../client.js";
import { applyIdentifiers, NO_IDENTIFIER_MSG } from "../identify.js";
import { describeFailure, isSuccess, toOperationResponse } from "../response.js";

export const updateCustomerSchema = z.object({
  operation: z
    .string()
    .default("Website.UpdateCustomer")
    .describe(
      "Системное имя операции Mindbox для обновления клиента (должно совпадать с настроенным в проекте)",
    ),
  email: z.string().email().optional().describe("Email клиента"),
  phone: z.string().trim().optional().describe("Телефон клиента"),
  external_id: z.string().trim().optional().describe("Внешний ID клиента"),
  first_name: z.string().optional().describe("Имя"),
  last_name: z.string().optional().describe("Фамилия"),
  birth_date: z.string().optional().describe("Дата рождения (YYYY-MM-DD)"),
  custom_fields: z.record(z.string(), z.unknown()).optional().describe("Кастомные поля"),
});

export async function handleUpdateCustomer(
  params: z.infer<typeof updateCustomerSchema>,
): Promise<string> {
  const customer: Record<string, unknown> = {};
  if (!applyIdentifiers(customer, params)) {
    return NO_IDENTIFIER_MSG;
  }
  if (params.first_name) customer.firstName = params.first_name;
  if (params.last_name) customer.lastName = params.last_name;
  if (params.birth_date) customer.birthDate = params.birth_date;
  if (params.custom_fields) customer.customFields = params.custom_fields;

  const result = toOperationResponse(await getClient().operation(params.operation, { customer }));

  return JSON.stringify(
    {
      статус: result.status,
      клиент: result.customer
        ? {
            ids: result.customer.ids,
            email: result.customer.email,
            имя: result.customer.firstName,
            фамилия: result.customer.lastName,
          }
        : null,
      ошибка: isSuccess(result) ? undefined : describeFailure(result),
    },
    null,
    2,
  );
}
