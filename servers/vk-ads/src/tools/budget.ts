import { z } from "zod";
import { apiGet } from "../client.js";

export const getBudgetSchema = z.object({
  account_id: z.number().describe("ID рекламного кабинета"),
});

export async function handleGetBudget(params: z.infer<typeof getBudgetSchema>): Promise<string> {
  const data = await apiGet("/budget.json", {
    account_id: String(params.account_id),
  });
  return JSON.stringify(data, null, 2);
}
