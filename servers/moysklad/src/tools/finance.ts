import { z } from "zod";
import { moyskladPost } from "../client.js";
import { buildDocBody, fetchDocumentList, formatDocument, meta, positionInputSchema } from "../lib.js";
import type { ToolDef } from "../types.js";

const orgHref = z.string().describe("Meta href of the organization. Get from list_organizations");
const agentHref = z.string().describe("Meta href of the counterparty. Get from get_counterparties");
const sumRubles = z.number().describe("Amount in RUBLES (converted to kopecks internally)");
const listParams = {
  search: z.string().optional().describe("Search by name/number"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
};

// Incoming money: paymentin (bank), cashin (cash). Body: org + agent + sum.
const incomingMoneySchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  sum_rubles: sumRubles,
  description: z.string().optional().describe("Comment"),
  incoming_number: z.string().optional().describe("Incoming document number"),
  incoming_date: z.string().optional().describe("Incoming document date (ISO 8601)"),
});

// Outgoing money: paymentout (bank), cashout (cash). expenseItem may be required.
const outgoingMoneySchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  sum_rubles: sumRubles,
  expense_item_href: z
    .string()
    .optional()
    .describe("Meta href of the expense item (статья расходов). MoySklad may require this for outgoing payments."),
  description: z.string().optional().describe("Comment"),
});

function incomingBody(p: z.infer<typeof incomingMoneySchema>): Record<string, unknown> {
  return buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    sum_rubles: p.sum_rubles,
    description: p.description,
    incoming_number: p.incoming_number,
    incoming_date: p.incoming_date,
  });
}

function outgoingBody(p: z.infer<typeof outgoingMoneySchema>): Record<string, unknown> {
  return buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    sum_rubles: p.sum_rubles,
    description: p.description,
    extra: p.expense_item_href ? { expenseItem: meta(p.expense_item_href, "expenseitem") } : undefined,
  });
}

// --- paymentin / paymentout (bank) ---
export const createPaymentInSchema = incomingMoneySchema;
export async function handleCreatePaymentIn(p: z.infer<typeof createPaymentInSchema>): Promise<string> {
  return formatDocument(await moyskladPost("/entity/paymentin", incomingBody(p)));
}
export const createPaymentOutSchema = outgoingMoneySchema;
export async function handleCreatePaymentOut(p: z.infer<typeof createPaymentOutSchema>): Promise<string> {
  return formatDocument(await moyskladPost("/entity/paymentout", outgoingBody(p)));
}

// --- cashin / cashout (cash register) ---
export const createCashInSchema = incomingMoneySchema;
export async function handleCreateCashIn(p: z.infer<typeof createCashInSchema>): Promise<string> {
  return formatDocument(await moyskladPost("/entity/cashin", incomingBody(p)));
}
export const createCashOutSchema = outgoingMoneySchema;
export async function handleCreateCashOut(p: z.infer<typeof createCashOutSchema>): Promise<string> {
  return formatDocument(await moyskladPost("/entity/cashout", outgoingBody(p)));
}

// --- invoiceout (счёт покупателю) / invoicein (счёт поставщика) ---
const invoiceSchema = z.object({
  organization_href: orgHref,
  agent_href: agentHref,
  positions: z.array(positionInputSchema).min(1).describe("Invoice line items"),
  description: z.string().optional().describe("Comment"),
});

export const createInvoiceOutSchema = invoiceSchema;
export async function handleCreateInvoiceOut(p: z.infer<typeof createInvoiceOutSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/invoiceout", body));
}
export const createInvoiceInSchema = invoiceSchema;
export async function handleCreateInvoiceIn(p: z.infer<typeof createInvoiceInSchema>): Promise<string> {
  const body = buildDocBody({
    organization_href: p.organization_href,
    agent_href: p.agent_href,
    positions: p.positions,
    description: p.description,
  });
  return formatDocument(await moyskladPost("/entity/invoicein", body));
}

export const getInvoicesOutSchema = z.object(listParams);
export async function handleGetInvoicesOut(p: z.infer<typeof getInvoicesOutSchema>): Promise<string> {
  return fetchDocumentList("invoiceout", p, "invoices");
}

export const tools: ToolDef[] = [
  {
    name: "create_payment_in",
    description: "Create an incoming bank payment (входящий платёж). Amount in RUBLES.",
    schema: createPaymentInSchema,
    handler: handleCreatePaymentIn,
  },
  {
    name: "create_payment_out",
    description: "Create an outgoing bank payment (исходящий платёж). Amount in RUBLES.",
    schema: createPaymentOutSchema,
    handler: handleCreatePaymentOut,
  },
  {
    name: "create_cash_in",
    description: "Create a cash receipt order (приходный кассовый ордер). Amount in RUBLES.",
    schema: createCashInSchema,
    handler: handleCreateCashIn,
  },
  {
    name: "create_cash_out",
    description: "Create a cash expense order (расходный кассовый ордер). Amount in RUBLES.",
    schema: createCashOutSchema,
    handler: handleCreateCashOut,
  },
  {
    name: "create_invoice_out",
    description: "Create a sales invoice (счёт покупателю) with line items. Prices in RUBLES.",
    schema: createInvoiceOutSchema,
    handler: handleCreateInvoiceOut,
  },
  {
    name: "create_invoice_in",
    description: "Create a supplier invoice (счёт поставщика). Prices in RUBLES.",
    schema: createInvoiceInSchema,
    handler: handleCreateInvoiceIn,
  },
  {
    name: "get_invoices_out",
    description: "List sales invoices (счета покупателям) with sums in rubles.",
    schema: getInvoicesOutSchema,
    handler: handleGetInvoicesOut,
  },
];
