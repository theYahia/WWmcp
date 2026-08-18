import { z } from "zod";
import { retailCrmGet } from "../client.js";
import { ok, runTool, valuesOf, type ToolResult } from "../format/index.js";
import { rawField } from "./common.js";

export const emptyWithRaw = z.object({ raw: rawField });

/** GET a reference endpoint and flatten its keyed-by-code object into a compact array. */
async function reference(path: string, key: string, raw: boolean | undefined): Promise<ToolResult> {
  return runTool(async () => {
    const result = await retailCrmGet(path) as Record<string, unknown>;
    if (raw) return ok(result);
    return ok({ [key]: valuesOf(result?.[key]) });
  });
}

// ── list_statuses ────────────────────────────────────────────
export const listStatusesSchema = emptyWithRaw;
export const handleListStatuses = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/statuses", "statuses", p.raw);

// ── list_delivery_types ──────────────────────────────────────
export const listDeliveryTypesSchema = emptyWithRaw;
export const handleListDeliveryTypes = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/delivery-types", "deliveryTypes", p.raw);

// ── list_payment_types ───────────────────────────────────────
export const listPaymentTypesSchema = emptyWithRaw;
export const handleListPaymentTypes = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/payment-types", "paymentTypes", p.raw);

// ── list_stores ──────────────────────────────────────────────
export const listStoresSchema = emptyWithRaw;
export const handleListStores = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/stores", "stores", p.raw);

// ── list_sites ───────────────────────────────────────────────
export const listSitesSchema = emptyWithRaw;
export const handleListSites = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/sites", "sites", p.raw);

// ── list_countries ───────────────────────────────────────────
export const listCountriesSchema = emptyWithRaw;
export const handleListCountries = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/countries", "countriesIso", p.raw);

// ── list_order_types ─────────────────────────────────────────
export const listOrderTypesSchema = emptyWithRaw;
export const handleListOrderTypes = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/order-types", "orderTypes", p.raw);

// ── list_order_methods ───────────────────────────────────────
export const listOrderMethodsSchema = emptyWithRaw;
export const handleListOrderMethods = (p: z.infer<typeof emptyWithRaw>) => reference("/reference/order-methods", "orderMethods", p.raw);
