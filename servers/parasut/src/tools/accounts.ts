import { z } from "zod";
import { parasutGet } from "../client.js";
import { formatList, formatResource, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");

// --- list_accounts ---
const listAccountsSchema = z.object({
  name: z.string().optional().describe("Filter by account name"),
  currency: z.enum(["TRL", "USD", "EUR", "GBP"]).optional().describe("Filter by currency"),
  sort: z.string().optional().describe("Sort field, '-' prefix for desc (e.g. '-balance')"),
  page,
  per_page: perPage,
});

async function listAccounts(p: z.infer<typeof listAccountsSchema>): Promise<string> {
  const qs = listQuery({
    page: p.page,
    pageSize: p.per_page,
    sort: p.sort,
    filters: { name: p.name, currency: p.currency },
  });
  return formatList(await parasutGet(`/accounts?${qs}`), "accounts");
}

// --- get_account ---
const getAccountSchema = z.object({
  id: z.string().describe("Account ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload"),
});

async function getAccount(p: z.infer<typeof getAccountSchema>): Promise<string> {
  return formatResource(await parasutGet(`/accounts/${p.id}`), p.raw);
}

// --- list_account_transactions ---
const listAccountTxnsSchema = z.object({
  account_id: z.string().describe("Account ID"),
  page,
  per_page: perPage,
});

async function listAccountTransactions(p: z.infer<typeof listAccountTxnsSchema>): Promise<string> {
  const qs = listQuery({ page: p.page, pageSize: p.per_page });
  return formatList(await parasutGet(`/accounts/${p.account_id}/transactions?${qs}`), "transactions");
}

export const tools: ToolDef[] = [
  {
    name: "list_accounts",
    description:
      "List cash and bank accounts. Use an account's ID as account_id when recording payments/collections.",
    schema: listAccountsSchema,
    handler: listAccounts,
  },
  {
    name: "get_account",
    description: "Get a single cash/bank account by ID (with balance).",
    schema: getAccountSchema,
    handler: getAccount,
  },
  {
    name: "list_account_transactions",
    description: "List the money movements (transactions) on a cash/bank account.",
    schema: listAccountTxnsSchema,
    handler: listAccountTransactions,
  },
];
