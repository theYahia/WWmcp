import { z } from "zod";
import { moyskladGet, moyskladPost, moyskladPut } from "../client.js";

// --- search_products ---
export const searchProductsSchema = z.object({
  search: z.string().optional().describe("Search query for product name"),
  filter_article: z.string().optional().describe("Filter by article/SKU"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results (max 1000)"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleSearchProducts(params: z.infer<typeof searchProductsSchema>): Promise<string> {
  const query = new URLSearchParams();
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));
  if (params.search) query.set("search", params.search);
  if (params.filter_article) query.set("filter", `article=${params.filter_article}`);

  const result = await moyskladGet(`/entity/product?${query.toString()}`);
  return formatProducts(result);
}

// --- get_product ---
export const getProductSchema = z.object({
  id: z.string().describe("Product UUID"),
});

export async function handleGetProduct(params: z.infer<typeof getProductSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/product/${params.id}`);
  return formatProduct(result);
}

// --- create_product ---
export const createProductSchema = z.object({
  name: z.string().describe("Product name"),
  article: z.string().optional().describe("Article/SKU"),
  description: z.string().optional().describe("Product description"),
  code: z.string().optional().describe("Product code"),
  sale_price_rubles: z.number().optional().describe("Sale price in RUBLES (converted to kopecks internally)"),
  buy_price_rubles: z.number().optional().describe("Buy/cost price in RUBLES (converted to kopecks internally)"),
  min_price_rubles: z.number().optional().describe("Minimum price in RUBLES"),
  weight: z.number().optional().describe("Weight in grams"),
  volume: z.number().optional().describe("Volume in liters"),
  vat: z.number().optional().describe("VAT rate: 0, 10, 20"),
});

export async function handleCreateProduct(params: z.infer<typeof createProductSchema>): Promise<string> {
  const body: Record<string, unknown> = { name: params.name };
  if (params.article) body.article = params.article;
  if (params.description) body.description = params.description;
  if (params.code) body.code = params.code;
  if (params.weight !== undefined) body.weight = params.weight;
  if (params.volume !== undefined) body.volume = params.volume;
  if (params.vat !== undefined) body.effectiveVat = params.vat;
  if (params.sale_price_rubles !== undefined) {
    body.salePrices = [{ value: Math.round(params.sale_price_rubles * 100), priceType: { meta: { href: "", type: "pricetype", mediaType: "application/json" } } }];
  }
  if (params.buy_price_rubles !== undefined) {
    body.buyPrice = { value: Math.round(params.buy_price_rubles * 100) };
  }
  if (params.min_price_rubles !== undefined) {
    body.minPrice = { value: Math.round(params.min_price_rubles * 100) };
  }
  const result = await moyskladPost("/entity/product", body);
  return formatProduct(result);
}

// --- update_prices ---
export const updatePricesSchema = z.object({
  id: z.string().describe("Product UUID"),
  sale_price_rubles: z.number().optional().describe("New sale price in RUBLES"),
  buy_price_rubles: z.number().optional().describe("New buy/cost price in RUBLES"),
  min_price_rubles: z.number().optional().describe("New minimum price in RUBLES"),
});

export async function handleUpdatePrices(params: z.infer<typeof updatePricesSchema>): Promise<string> {
  const body: Record<string, unknown> = {};
  if (params.sale_price_rubles !== undefined) {
    const current = (await moyskladGet(`/entity/product/${params.id}`)) as Record<string, unknown>;
    const salePrices = (current.salePrices as Array<Record<string, unknown>>) || [];
    if (salePrices.length > 0) {
      salePrices[0].value = Math.round(params.sale_price_rubles * 100);
      body.salePrices = salePrices;
    } else {
      body.salePrices = [{ value: Math.round(params.sale_price_rubles * 100) }];
    }
  }
  if (params.buy_price_rubles !== undefined) {
    body.buyPrice = { value: Math.round(params.buy_price_rubles * 100) };
  }
  if (params.min_price_rubles !== undefined) {
    body.minPrice = { value: Math.round(params.min_price_rubles * 100) };
  }
  const result = await moyskladPut(`/entity/product/${params.id}`, body);
  return formatProduct(result);
}

// --- Formatting ---
function formatProduct(raw: unknown): string {
  const p = raw as Record<string, unknown>;
  const salePrices = (p.salePrices as Array<{ value: number }>) || [];
  const buyPrice = p.buyPrice as { value: number } | undefined;
  return JSON.stringify({
    id: p.id, name: p.name, article: p.article, code: p.code, description: p.description,
    sale_price_rubles: salePrices.length > 0 ? salePrices[0].value / 100 : null,
    buy_price_rubles: buyPrice ? buyPrice.value / 100 : null,
    weight: p.weight, volume: p.volume, updated: p.updated,
  }, null, 2);
}

function formatProducts(raw: unknown): string {
  const data = raw as { meta: { size: number }; rows: unknown[] };
  return JSON.stringify({
    total: data.meta?.size,
    products: data.rows?.map(formatProductRow) ?? [],
  }, null, 2);
}

function formatProductRow(raw: unknown): Record<string, unknown> {
  const p = raw as Record<string, unknown>;
  const salePrices = (p.salePrices as Array<{ value: number }>) || [];
  const buyPrice = p.buyPrice as { value: number } | undefined;
  return {
    id: p.id, name: p.name, article: p.article, code: p.code,
    sale_price_rubles: salePrices.length > 0 ? salePrices[0].value / 100 : null,
    buy_price_rubles: buyPrice ? buyPrice.value / 100 : null,
  };
}
