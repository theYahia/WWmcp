import { z } from "zod";
import { sberFetch } from "../client.js";

// --- get_accounts ---
export const getAccountsSchema = z.object({});

export async function handleGetAccounts(): Promise<string> {
  const result = await sberFetch("/fintech/v1/accounts");
  return JSON.stringify(result, null, 2);
}

// --- get_balance ---
export const getBalanceSchema = z.object({
  account_id: z.string().describe("ID счёта"),
});

export async function handleGetBalance(
  params: z.infer<typeof getBalanceSchema>,
): Promise<string> {
  const result = await sberFetch(`/fintech/v1/accounts/${params.account_id}/balance`);
  return JSON.stringify(result, null, 2);
}
