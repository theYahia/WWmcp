import { z } from "zod";
import { sberFetch } from "../client.js";

// --- get_company_info ---
// Сведения об организации-клиенте (реквизиты, ИНН, список счетов).
// По документации СберБизнес — эндпоинт client-info (scope GET_CLIENT_ACCOUNTS).
// VERIFY: путь зависит от версии API; переопределяется через SBER_BASE_URL.
export const getCompanyInfoSchema = z.object({});

export async function handleGetCompanyInfo(): Promise<string> {
  const result = await sberFetch("/fintech/v1/client-info");
  return JSON.stringify(result, null, 2);
}
