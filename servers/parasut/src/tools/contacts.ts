import { z } from "zod";
import { parasutGet, parasutPost } from "../client.js";
import { formatList, formatResource, json, jsonApiBody, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");

// --- list_contacts ---
const listContactsSchema = z.object({
  account_type: z.enum(["customer", "supplier"]).optional().describe("Filter customers vs suppliers"),
  name: z.string().optional().describe("Search by name"),
  sort: z.string().optional().describe("Sort field, prefix '-' for descending (e.g. '-balance', 'name')"),
  page,
  per_page: perPage,
});

async function listContacts(p: z.infer<typeof listContactsSchema>): Promise<string> {
  const qs = listQuery({
    page: p.page,
    pageSize: p.per_page,
    sort: p.sort,
    filters: { account_type: p.account_type, name: p.name },
  });
  return formatList(await parasutGet(`/contacts?${qs}`), "contacts");
}

// --- get_contact ---
const getContactSchema = z.object({
  id: z.string().describe("Contact ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload instead of a summary"),
});

async function getContact(p: z.infer<typeof getContactSchema>): Promise<string> {
  return formatResource(await parasutGet(`/contacts/${p.id}?include=category`), p.raw);
}

// --- create_contact ---
const createContactSchema = z.object({
  name: z.string().describe("Contact name (required)"),
  account_type: z.enum(["customer", "supplier"]).describe("Whether this contact is a customer or a supplier (required)"),
  contact_type: z.enum(["person", "company"]).default("company").describe("Person or company"),
  email: z.string().optional().describe("Email"),
  phone: z.string().optional().describe("Phone number"),
  tax_number: z.string().optional().describe("Tax number / TC kimlik no (VKN/TCKN)"),
  tax_office: z.string().optional().describe("Tax office"),
  iban: z.string().optional().describe("IBAN"),
  city: z.string().optional().describe("City (il)"),
  district: z.string().optional().describe("District (ilçe)"),
  address: z.string().optional().describe("Full address"),
  is_abroad: z.boolean().optional().describe("Whether the contact is abroad"),
});

async function createContact(p: z.infer<typeof createContactSchema>): Promise<string> {
  const body = jsonApiBody("contacts", {
    name: p.name,
    account_type: p.account_type,
    contact_type: p.contact_type,
    email: p.email,
    phone: p.phone,
    tax_number: p.tax_number,
    tax_office: p.tax_office,
    iban: p.iban,
    city: p.city,
    district: p.district,
    address: p.address,
    is_abroad: p.is_abroad,
  });
  return formatResource(await parasutPost("/contacts", body));
}

// --- collect_from_contact / pay_to_contact (balance transactions) ---
const contactTxnSchema = z.object({
  contact_id: z.string().describe("Contact ID"),
  account_id: z.string().describe("Cash/bank account ID to move the money through (see list_accounts)"),
  amount: z.number().describe("Amount"),
  date: z.string().describe("Transaction date (YYYY-MM-DD)"),
  description: z.string().optional().describe("Description"),
  exchange_rate: z.number().optional().describe("Exchange rate to TRL if account currency differs from the document"),
  payable_ids: z.array(z.number()).optional().describe("Invoice/bill IDs to match this transaction against first"),
});

function contactTxnBody(p: z.infer<typeof contactTxnSchema>) {
  return jsonApiBody(
    "transactions",
    {
      account_id: Number(p.account_id),
      amount: p.amount,
      date: p.date,
      description: p.description,
      exchange_rate: p.exchange_rate,
      payable_ids: p.payable_ids,
    },
  );
}

async function collectFromContact(p: z.infer<typeof contactTxnSchema>): Promise<string> {
  const raw = await parasutPost(`/contacts/${p.contact_id}/contact_debit_transactions`, contactTxnBody(p));
  return json(raw);
}

async function payToContact(p: z.infer<typeof contactTxnSchema>): Promise<string> {
  const raw = await parasutPost(`/contacts/${p.contact_id}/contact_credit_transactions`, contactTxnBody(p));
  return json(raw);
}

export const tools: ToolDef[] = [
  {
    name: "list_contacts",
    description: "List contacts (customers/suppliers). Filter by account_type and name.",
    schema: listContactsSchema,
    handler: listContacts,
  },
  {
    name: "get_contact",
    description: "Get a single contact by ID (with its category).",
    schema: getContactSchema,
    handler: getContact,
  },
  {
    name: "create_contact",
    description:
      "Create a contact. account_type (customer/supplier) is REQUIRED; contact_type is person/company.",
    schema: createContactSchema,
    handler: createContact,
  },
  {
    name: "collect_from_contact",
    description:
      "Record a collection (money received) against a customer's balance, optionally matched to sales-invoice IDs via payable_ids.",
    schema: contactTxnSchema,
    handler: collectFromContact,
  },
  {
    name: "pay_to_contact",
    description:
      "Record a payment (money paid) against a supplier's balance, optionally matched to purchase-bill IDs via payable_ids.",
    schema: contactTxnSchema,
    handler: payToContact,
  },
];
