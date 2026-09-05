import { z } from "zod";
import { moyskladGet, moyskladPost, moyskladPut } from "../client.js";
import { buildFilter, getDefaultPriceTypeHref, json, kopToRub, listQuery, meta, rubToKop } from "../lib.js";
import type { ToolDef } from "../types.js";

// --- search_products ---
export const searchProductsSchema = z.object({
  search: z.string().optional().describe("Search query for product name"),
  filter_article: z.string().optional().describe("Filter by article/SKU"),
  limit: z.number().int().min(1).max(1000).default(25).describe("Number of results (max 1000)"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleSearchProducts(params: z.infer<typeof searchProductsSchema>): Promise<string> {
  const filter = buildFilter([["article", params.filter_article ?? ""]]);
  const qs = listQuery({ limit: params.limit, offset: params.offset, search: params.search, filter });
  const result = await moyskladGet(`/entity/product?${qs}`);
  return formatProducts(result);
}

// --- get_product ---
export const getProductSchema = z.object({
  id: z.string().describe("Product UUID"),
  raw: z.boolean().optional().describe("Return the full raw MoySklad object instead of the summary"),
});

export async function handleGetProduct(params: z.infer<typeof getProductSchema>): Promise<string> {
  const result = await moyskladGet(`/entity/product/${params.id}`);
  return params.raw ? json(result) : formatProduct(result);
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
  price_type_href: z
    .string()
    .optional()
    .describe(
      "Meta href of the price type for the sale price (defaults to the account's default). Get from list_price_types.",
    ),
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
    const priceTypeHref = params.price_type_href ?? (await getDefaultPriceTypeHref());
    body.salePrices = [{ value: rubToKop(params.sale_price_rubles), priceType: meta(priceTypeHref, "pricetype") }];
  }
  if (params.buy_price_rubles !== undefined) {
    body.buyPrice = { value: rubToKop(params.buy_price_rubles) };
  }
  if (params.min_price_rubles !== undefined) {
    body.minPrice = { value: rubToKop(params.min_price_rubles) };
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
    // Read-modify-write: preserve the existing price type when there is one;
    // otherwise attach the account default (MoySklad requires a price type).
    const current = (await moyskladGet(`/entity/product/${params.id}`)) as {
      salePrices?: Array<Record<string, unknown>>;
    };
    const existing = current.salePrices ?? [];
    if (existing.length > 0) {
      body.salePrices = existing.map((sp, i) => (i === 0 ? { ...sp, value: rubToKop(params.sale_price_rubles!) } : sp));
    } else {
      const priceTypeHref = await getDefaultPriceTypeHref();
      body.salePrices = [{ value: rubToKop(params.sale_price_rubles), priceType: meta(priceTypeHref, "pricetype") }];
    }
  }
  if (params.buy_price_rubles !== undefined) {
    body.buyPrice = { value: rubToKop(params.buy_price_rubles) };
  }
  if (params.min_price_rubles !== undefined) {
    body.minPrice = { value: rubToKop(params.min_price_rubles) };
  }
  const result = await moyskladPut(`/entity/product/${params.id}`, body);
  return formatProduct(result);
}

// --- Formatting ---
function salePricesToRubles(raw: Record<string, unknown>): Array<{ value: number | null; price_type: string | null }> {
  const salePrices = (raw.salePrices as Array<Record<string, unknown>>) || [];
  return salePrices.map((sp) => ({
    value: kopToRub(sp.value),
    price_type: ((sp.priceType as { name?: unknown })?.name as string) ?? null,
  }));
}

function formatProduct(raw: unknown): string {
  const p = (raw ?? {}) as Record<string, unknown>;
  const prices = salePricesToRubles(p);
  const buyPrice = p.buyPrice as { value: number } | undefined;
  return json({
    id: p.id,
    name: p.name,
    article: p.article,
    code: p.code,
    description: p.description,
    sale_price_rubles: prices[0]?.value ?? null,
    sale_prices: prices,
    buy_price_rubles: buyPrice ? kopToRub(buyPrice.value) : null,
    weight: p.weight,
    volume: p.volume,
    updated: p.updated,
  });
}

function formatProducts(raw: unknown): string {
  const data = (raw ?? {}) as { meta?: { size?: number }; rows?: unknown[] };
  return json({
    total: data.meta?.size,
    products: (data.rows ?? []).map((row) => {
      const p = (row ?? {}) as Record<string, unknown>;
      const prices = salePricesToRubles(p);
      const buyPrice = p.buyPrice as { value: number } | undefined;
      return {
        id: p.id,
        name: p.name,
        article: p.article,
        code: p.code,
        sale_price_rubles: prices[0]?.value ?? null,
        buy_price_rubles: buyPrice ? kopToRub(buyPrice.value) : null,
      };
    }),
  });
}

export const tools: ToolDef[] = [
  {
    name: "search_products",
    description: "Search products in MoySklad by name or article/SKU. Returns a paginated list with sale and buy prices in rubles. Supports offset-based pagination up to 1000 results per page. Use filter_article for exact SKU lookup.",
    schema: searchProductsSchema,
    handler: handleSearchProducts,
  },
  {
    name: "get_product",
    description: "Get a single product by its UUID. Returns name, article, code, description, all sale prices with their price types, buy price, weight, volume and last update timestamp. Prices are in rubles (converted from kopecks internally). Pass raw:true for the untouched MoySklad object.",
    schema: getProductSchema,
    handler: handleGetProduct,
  },
  {
    name: "create_product",
    description: "Create a new product in MoySklad. Accepts name, article/SKU, description, code, prices in rubles (automatically converted to kopecks for the API), weight in grams, volume in liters, and VAT rate. The sale price is attached to the account's default price type unless price_type_href is given. Returns the created product with its assigned UUID.",
    schema: createProductSchema,
    handler: handleCreateProduct,
  },
  {
    name: "update_prices",
    description: "Update sale, buy, or minimum prices for an existing product by UUID. All prices are specified in rubles and converted to kopecks internally. Preserves the existing price type when updating a sale price, and falls back to the account default when the product has none. Returns the updated product.",
    schema: updatePricesSchema,
    handler: handleUpdatePrices,
  },
];
