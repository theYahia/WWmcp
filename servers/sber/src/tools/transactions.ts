import { z } from "zod";
import { sberFetch } from "../client.js";
import type { StatementResponse, Transaction } from "../types.js";

// Сборка query-параметров выписки. VERIFY имена параметров (accountId / accountNumber,
// dateFrom / statementDate, page) по вашей версии СберБизнес API.
function statementQuery(p: {
  account_id: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}): string {
  const query = new URLSearchParams();
  query.set("accountId", p.account_id);
  if (p.date_from) query.set("dateFrom", p.date_from);
  if (p.date_to) query.set("dateTo", p.date_to);
  if (p.page !== undefined) query.set("page", String(p.page));
  return query.toString();
}

// --- get_statement (список транзакций) ---
export const getStatementSchema = z.object({
  account_id: z.string().describe("ID счёта"),
  date_from: z.string().optional().describe("Дата начала (YYYY-MM-DD)"),
  date_to: z.string().optional().describe("Дата окончания (YYYY-MM-DD)"),
  page: z.number().int().positive().optional().describe("Номер страницы (с 1) для пагинации"),
});

export async function handleGetStatement(
  params: z.infer<typeof getStatementSchema>,
): Promise<string> {
  const result = await sberFetch(`/fintech/v1/statement?${statementQuery(params)}`);
  return JSON.stringify(result, null, 2);
}

// --- summarize_transactions (агрегат по выписке) ---
export const summarizeTransactionsSchema = z.object({
  account_id: z.string().describe("ID счёта"),
  date_from: z.string().optional().describe("Дата начала (YYYY-MM-DD)"),
  date_to: z.string().optional().describe("Дата окончания (YYYY-MM-DD)"),
});

export async function handleSummarizeTransactions(
  params: z.infer<typeof summarizeTransactionsSchema>,
): Promise<string> {
  const data = (await sberFetch(
    `/fintech/v1/statement?${statementQuery(params)}`,
  )) as StatementResponse;

  const transactions: Transaction[] = data.transactions ?? [];
  let totalIncome = 0;
  let totalExpense = 0;
  for (const tx of transactions) {
    if (tx.amount >= 0) totalIncome += tx.amount;
    else totalExpense += Math.abs(tx.amount);
  }

  const summary = {
    accountId: data.account ?? params.account_id,
    dateFrom: data.dateFrom ?? params.date_from ?? null,
    dateTo: data.dateTo ?? params.date_to ?? null,
    count: transactions.length,
    totalIncome,
    totalExpense,
    net: totalIncome - totalExpense,
    currency: transactions[0]?.currency ?? "RUB",
  };

  return JSON.stringify(summary, null, 2);
}
