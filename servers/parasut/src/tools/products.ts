import { z } from "zod";
import { parasutGet, parasutPost } from "../client.js";
import { formatList, formatResource, jsonApiBody, listQuery } from "../lib.js";
import type { ToolDef } from "../types.js";

const page = z.number().int().min(1).default(1).describe("Page number (1-based)");
const perPage = z.number().int().min(1).max(25).default(25).describe("Items per page (max 25)");
const CURRENCY = z.enum(["TRL", "USD", "EUR", "GBP"]);

// --- list_products ---
const listProductsSchema = z.object({
  name: z.string().optional().describe("Search by product/service name"),
  code: z.string().optional().describe("Filter by product code"),
  sort: z.string().optional().describe("Sort field, '-' prefix for desc"),
  page,
  per_page: perPage,
});

async function listProducts(p: z.infer<typeof listProductsSchema>): Promise<string> {
  const qs = listQuery({
    page: p.page,
    pageSize: p.per_page,
    sort: p.sort,
    filters: { name: p.name, code: p.code },
  });
  return formatList(await parasutGet(`/products?${qs}`), "products");
}

// --- get_product ---
const getProductSchema = z.object({
  id: z.string().describe("Product ID"),
  raw: z.boolean().optional().describe("Return the full raw JSON:API payload"),
});

async function getProduct(p: z.infer<typeof getProductSchema>): Promise<string> {
  return formatResource(await parasutGet(`/products/${p.id}`), p.raw);
}

// --- create_product ---
const createProductSchema = z.object({
  name: z.string().describe("Product/service name (required)"),
  vat_rate: z.number().default(20).describe("VAT (KDV) rate %, Turkey standard is 20"),
  unit: z.string().optional().describe("Unit (e.g. 'Adet', 'Saat')"),
  list_price: z.number().optional().describe("Sale price"),
  currency: CURRENCY.optional().describe("Sale currency (Turkish Lira is TRL, not TRY)"),
  buying_price: z.number().optional().describe("Purchase price"),
  buying_currency: CURRENCY.optional().describe("Purchase currency"),
  code: z.string().optional().describe("Product code"),
  barcode: z.string().optional().describe("Barcode"),
  inventory_tracking: z.boolean().optional().describe("Track stock for this product"),
});

async function createProduct(p: z.infer<typeof createProductSchema>): Promise<string> {
  const body = jsonApiBody("products", {
    name: p.name,
    vat_rate: p.vat_rate,
    unit: p.unit,
    list_price: p.list_price,
    currency: p.currency,
    buying_price: p.buying_price,
    buying_currency: p.buying_currency,
    code: p.code,
    barcode: p.barcode,
    inventory_tracking: p.inventory_tracking,
  });
  return formatResource(await parasutPost("/products", body));
}

export const tools: ToolDef[] = [
  {
    name: "list_products",
    description: "List products and services. Search by name or code.",
    schema: listProductsSchema,
    handler: listProducts,
  },
  {
    name: "get_product",
    description: "Get a single product by ID.",
    schema: getProductSchema,
    handler: getProduct,
  },
  {
    name: "create_product",
    description: "Create a product or service. VAT default is 20% (Turkey standard).",
    schema: createProductSchema,
    handler: createProduct,
  },
];
