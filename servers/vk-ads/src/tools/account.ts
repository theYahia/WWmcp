import { z } from "zod";
import { apiGet } from "../client.js";

/**
 * Информация о рекламном кабинете и баланс.
 * Заменяет прежний get_budget (ресурса /budget.json в v2 нет). Баланс читается из /user.json
 * (требует OAuth scope read_payments — «read cash transactions and balance»).
 * account_id НЕ передаётся: кабинет определяется самим токеном (agency_client_credentials для агентств).
 */

export const getAccountSchema = z.object({
  fields: z.string().optional().describe("Список полей через запятую (проекция); по умолчанию — весь объект user"),
});

export async function handleGetAccount(params: z.infer<typeof getAccountSchema>) {
  const query: Record<string, string> = {};
  if (params.fields) query.fields = params.fields;
  // VERIFY: точное поле баланса внутри user.json (endpoint и scope подтверждены, путь поля — нет).
  const data = await apiGet("/user.json", query);
  return { account: data };
}
