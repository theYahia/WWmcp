import { z } from "zod";
import { parasutDelete, parasutGet, parasutPatch, parasutPost } from "../client.js";
import { dateRangeFilter, formatList, formatResource, json, jsonApiBody, listQuery, rel } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");
const CURRENCY = z.enum(["TRL", "USD", "EUR", "GBP"]);

// --- list_sales_invoices ---
const listSalesInvoicesSchema = z.object({
  contact_id: z.string().optional().describe("Filter by customer contact ID"),
  item_type: z.enum(["invoice", "estimate", "cancelled", "refund"]).optional().describe("Filter by item type"),
  issue_date_from: z.string().optional().describe("Issue date from (YYYY-MM-DD)"),
  issue_date_to: z.string().optional().describe("Issue date to (YYYY-MM-DD)"),
  sort: z.string().optional().describe("Sort field, '-' prefix for desc (e.g. '-issue_date')"),
  page,
  per_page: perPage,
});

async function listSalesInvoices(p: z.infer<typeof listSalesInvoicesSchema>): Promise<string> {
  const qs = listQuery({
    page: p.page,
    pageSize: p.per_page,
    sort: p.sort,
    filters: {
      contact_id: p.contact_id,
      item_type: p.item_type,
      issue_date: dateRangeFilter(p.issue_date_from, p.issue_date_to),
    },
  });
  return formatList(await parasutGet(`/sales_invoices?${qs}`), "sales_invoices");
}

// --- get_sales_invoice ---
const getSalesInvoiceSchema = z.object({
  id: z.string().describe("Sales invoice ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload (with included details/contact)"),
});

async function getSalesInvoice(p: z.infer<typeof getSalesInvoiceSchema>): Promise<string> {
  return formatResource(await parasutGet(`/sales_invoices/${p.id}?include=details,contact,payments`), p.raw);
}

// --- create_sales_invoice ---
const lineItemSchema = z.object({
  product_id: z.string().describe("Product ID"),
  quantity: z.number().describe("Quantity"),
  unit_price: z.number().describe("Unit price"),
  vat_rate: z.number().default(20).describe("VAT (KDV) rate %, Turkey standard is 20 since 2023 (also 1/10)"),
  discount_value: z.number().optional().describe("Discount value"),
  discount_type: z.enum(["percentage", "amount"]).optional().describe("Discount type"),
  description: z.string().optional().describe("Line description"),
});

const createSalesInvoiceSchema = z.object({
  contact_id: z.string().describe("Customer contact ID"),
  issue_date: z.string().describe("Issue date (YYYY-MM-DD)"),
  due_date: z.string().optional().describe("Due date (YYYY-MM-DD)"),
  currency: CURRENCY.default("TRL").describe("Currency (Turkish Lira is TRL, not TRY)"),
  description: z.string().optional().describe("Invoice description"),
  item_type: z.enum(["invoice", "estimate"]).default("invoice").describe("Document type"),
  items: z.array(lineItemSchema).min(1).describe("Invoice line items"),
});

async function createSalesInvoice(p: z.infer<typeof createSalesInvoiceSchema>): Promise<string> {
  const body = jsonApiBody(
    "sales_invoices",
    {
      item_type: p.item_type,
      issue_date: p.issue_date,
      due_date: p.due_date,
      currency: p.currency,
      description: p.description,
    },
    {
      contact: rel(p.contact_id, "contacts"),
      details: {
        data: p.items.map((item, i) => ({
          type: "sales_invoice_details",
          // Temp ids correlate nested details on create (JSON:API local ids).
          id: `tmp_${i + 1}`,
          attributes: {
            quantity: item.quantity,
            unit_price: item.unit_price,
            vat_rate: item.vat_rate,
            discount_value: item.discount_value,
            discount_type: item.discount_type,
            description: item.description,
          },
          relationships: { product: rel(item.product_id, "products") },
        })),
      },
    },
  );
  return formatResource(await parasutPost("/sales_invoices?include=details", body));
}

// --- record_sales_invoice_payment ---
const paymentSchema = z.object({
  invoice_id: z.string().describe("Sales invoice ID"),
  account_id: z.string().describe("Cash/bank account ID receiving the collection (see list_accounts)"),
  amount: z.number().describe("Amount collected"),
  date: z.string().describe("Payment date (YYYY-MM-DD)"),
  description: z.string().optional().describe("Description"),
  exchange_rate: z.number().optional().describe("Exchange rate to TRL if account currency differs from the invoice"),
});

async function recordPayment(p: z.infer<typeof paymentSchema>): Promise<string> {
  const body = jsonApiBody("payments", {
    account_id: Number(p.account_id),
    amount: p.amount,
    date: p.date,
    description: p.description,
    exchange_rate: p.exchange_rate,
  });
  return json(await parasutPost(`/sales_invoices/${p.invoice_id}/payments`, body));
}

// --- lifecycle actions ---
const idSchema = z.object({ id: z.string().describe("Sales invoice ID") });

async function cancelSalesInvoice(p: z.infer<typeof idSchema>): Promise<string> {
  return json(await parasutDelete(`/sales_invoices/${p.id}/cancel`));
}
async function archiveSalesInvoice(p: z.infer<typeof idSchema>): Promise<string> {
  return json(await parasutPatch(`/sales_invoices/${p.id}/archive`));
}
async function recoverSalesInvoice(p: z.infer<typeof idSchema>): Promise<string> {
  return json(await parasutPatch(`/sales_invoices/${p.id}/recover`));
}
async function convertToInvoice(p: z.infer<typeof idSchema>): Promise<string> {
  return json(await parasutPatch(`/sales_invoices/${p.id}/convert_to_invoice`));
}

export const tools: ToolDef[] = [
  {
    name: "list_sales_invoices",
    description: "List sales invoices. Filter by contact, item_type and an issue-date range.",
    schema: listSalesInvoicesSchema,
    handler: listSalesInvoices,
  },
  {
    name: "get_sales_invoice",
    description: "Get a single sales invoice by ID (with details, contact and payments).",
    schema: getSalesInvoiceSchema,
    handler: getSalesInvoice,
  },
  {
    name: "create_sales_invoice",
    description: "Create a sales invoice (or estimate) with line items. VAT default is 20% (Turkey standard).",
    schema: createSalesInvoiceSchema,
    handler: createSalesInvoice,
  },
  {
    name: "record_sales_invoice_payment",
    description: "Record a collection (payment received) against a sales invoice, into a cash/bank account.",
    schema: paymentSchema,
    handler: recordPayment,
  },
  {
    name: "cancel_sales_invoice",
    description: "Cancel a sales invoice (HTTP DELETE on /cancel — does not delete the record, marks it cancelled).",
    schema: idSchema,
    handler: cancelSalesInvoice,
  },
  {
    name: "archive_sales_invoice",
    description: "Archive a sales invoice.",
    schema: idSchema,
    handler: archiveSalesInvoice,
  },
  {
    name: "recover_sales_invoice",
    description: "Recover (un-cancel) a cancelled sales invoice.",
    schema: idSchema,
    handler: recoverSalesInvoice,
  },
  {
    name: "convert_estimate_to_invoice",
    description: "Convert an estimate into an invoice.",
    schema: idSchema,
    handler: convertToInvoice,
  },
];
