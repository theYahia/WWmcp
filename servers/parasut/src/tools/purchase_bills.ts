import { z } from "zod";
import { parasutDelete, parasutGet, parasutPost } from "../client.js";
import { dateRangeFilter, formatList, formatResource, json, jsonApiBody, listQuery, rel } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");
const CURRENCY = z.enum(["TRL", "USD", "EUR", "GBP"]);

// --- list_purchase_bills ---
const listPurchaseBillsSchema = z.object({
  supplier_id: z.string().optional().describe("Filter by supplier contact ID"),
  item_type: z.enum(["purchase_bill", "refund", "cancelled"]).optional().describe("Filter by item type"),
  issue_date_from: z.string().optional().describe("Issue date from (YYYY-MM-DD)"),
  issue_date_to: z.string().optional().describe("Issue date to (YYYY-MM-DD)"),
  sort: z.string().optional().describe("Sort field, '-' prefix for desc (e.g. '-issue_date')"),
  page,
  per_page: perPage,
});

async function listPurchaseBills(p: z.infer<typeof listPurchaseBillsSchema>): Promise<string> {
  const qs = listQuery({
    page: p.page,
    pageSize: p.per_page,
    sort: p.sort,
    filters: {
      supplier_id: p.supplier_id,
      item_type: p.item_type,
      issue_date: dateRangeFilter(p.issue_date_from, p.issue_date_to),
    },
  });
  return formatList(await parasutGet(`/purchase_bills?${qs}`), "purchase_bills");
}

// --- get_purchase_bill ---
const getPurchaseBillSchema = z.object({
  id: z.string().describe("Purchase bill ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload"),
});

async function getPurchaseBill(p: z.infer<typeof getPurchaseBillSchema>): Promise<string> {
  return formatResource(await parasutGet(`/purchase_bills/${p.id}?include=details,supplier,payments`), p.raw);
}

// --- create_purchase_bill (basic) ---
const createPurchaseBillSchema = z.object({
  supplier_id: z.string().describe("Supplier contact ID"),
  issue_date: z.string().describe("Issue date (YYYY-MM-DD)"),
  due_date: z.string().describe("Due date (YYYY-MM-DD) — required by Parasut for basic bills"),
  net_total: z.number().describe("Net total (excluding VAT)"),
  total_vat: z.number().describe("Total VAT amount — required by Parasut for basic bills"),
  currency: CURRENCY.default("TRL").describe("Currency (Turkish Lira is TRL, not TRY)"),
  item_type: z.enum(["purchase_bill", "refund"]).default("purchase_bill").describe("Document type"),
  description: z.string().optional().describe("Bill description"),
  invoice_no: z.string().optional().describe("Supplier's invoice number"),
  exchange_rate: z.number().optional().describe("Exchange rate to TRL for foreign-currency bills"),
});

async function createPurchaseBill(p: z.infer<typeof createPurchaseBillSchema>): Promise<string> {
  const body = jsonApiBody(
    "purchase_bills",
    {
      item_type: p.item_type,
      issue_date: p.issue_date,
      due_date: p.due_date,
      currency: p.currency,
      net_total: p.net_total,
      total_vat: p.total_vat,
      description: p.description,
      invoice_no: p.invoice_no,
      exchange_rate: p.exchange_rate,
    },
    { supplier: rel(p.supplier_id, "contacts") },
  );
  return formatResource(await parasutPost("/purchase_bills", body));
}

// --- record_purchase_bill_payment ---
const paymentSchema = z.object({
  bill_id: z.string().describe("Purchase bill ID"),
  account_id: z.string().describe("Cash/bank account ID the payment comes from (see list_accounts)"),
  amount: z.number().describe("Amount paid"),
  date: z.string().describe("Payment date (YYYY-MM-DD)"),
  description: z.string().optional().describe("Description"),
  exchange_rate: z.number().optional().describe("Exchange rate to TRL if account currency differs from the bill"),
});

async function recordPayment(p: z.infer<typeof paymentSchema>): Promise<string> {
  const body = jsonApiBody("payments", {
    account_id: Number(p.account_id),
    amount: p.amount,
    date: p.date,
    description: p.description,
    exchange_rate: p.exchange_rate,
  });
  return json(await parasutPost(`/purchase_bills/${p.bill_id}/payments`, body));
}

// --- cancel_purchase_bill ---
const idSchema = z.object({ id: z.string().describe("Purchase bill ID") });
async function cancelPurchaseBill(p: z.infer<typeof idSchema>): Promise<string> {
  return json(await parasutDelete(`/purchase_bills/${p.id}/cancel`));
}

export const tools: ToolDef[] = [
  {
    name: "list_purchase_bills",
    description: "List purchase bills (supplier expenses). Filter by supplier, item_type and issue-date range.",
    schema: listPurchaseBillsSchema,
    handler: listPurchaseBills,
  },
  {
    name: "get_purchase_bill",
    description: "Get a single purchase bill by ID (with details, supplier and payments).",
    schema: getPurchaseBillSchema,
    handler: getPurchaseBill,
  },
  {
    name: "create_purchase_bill",
    description:
      "Create a basic purchase bill. Parasut requires due_date, net_total AND total_vat for basic bills.",
    schema: createPurchaseBillSchema,
    handler: createPurchaseBill,
  },
  {
    name: "record_purchase_bill_payment",
    description: "Record a payment made against a purchase bill, from a cash/bank account.",
    schema: paymentSchema,
    handler: recordPayment,
  },
  {
    name: "cancel_purchase_bill",
    description: "Cancel a purchase bill (HTTP DELETE on /cancel — marks it cancelled).",
    schema: idSchema,
    handler: cancelPurchaseBill,
  },
];
