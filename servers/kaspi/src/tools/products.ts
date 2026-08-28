import { z } from "zod";
import { kaspiGet } from "../client.js";
import type { KaspiJsonApiResponse, KaspiProduct } from "../types.js";

export const getProductsSchema = z.object({
  page_number: z.number().int().min(0).default(0).describe("Номер страницы (от 0)"),
  page_size: z.number().int().min(1).max(100).default(20).describe("Размер страницы"),
  is_active: z.boolean().optional().describe("Фильтр по активности товара"),
});

export async function handleGetProducts(params: z.infer<typeof getProductsSchema>): Promise<string> {
  const query: Record<string, string> = {
    "page[number]": String(params.page_number),
    "page[size]": String(params.page_size),
  };
  if (params.is_active !== undefined) {
    query["filter[merchantOffers][isActive]"] = String(params.is_active);
  }

  const result = (await kaspiGet("/merchantoffers", query)) as KaspiJsonApiResponse;

  const products = result.data as KaspiProduct[];
  if (!Array.isArray(products) || products.length === 0) {
    return "Товары не найдены.";
  }

  return JSON.stringify(products.map(p => ({
    id: p.id,
    sku: p.attributes.sku,
    название: p.attributes.masterProduct.name,
    производитель: p.attributes.masterProduct.manufacturer,
    цена: p.attributes.price,
    активен: p.attributes.isActive,
    наличие: p.attributes.availabilityStatus,
  })), null, 2);
}
