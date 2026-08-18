import { z } from "zod";
import { moyskladGet } from "./client.js";
import type { MoySkladMeta } from "./types.js";

/** Pretty-print a value as the text payload every tool returns. */
export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

// --- Money: MoySklad stores money in kopecks; tools speak rubles. ---

/** Rubles -> kopecks (integer), for request bodies. */
export function rubToKop(rubles: number): number {
  return Math.round(rubles * 100);
}

/** Kopecks -> rubles, for responses. Returns null for non-numeric input. */
export function kopToRub(kopecks: unknown): number | null {
  return typeof kopecks === "number" ? kopecks / 100 : null;
}

// --- Meta references ---

/**
 * Infer the MoySklad entity type from a meta href.
 * `.../entity/customerorder/<id>` -> "customerorder". Falls back to "product"
 * (the most common assortment type) when the path has no `/entity/<type>/`.
 */
export function metaTypeFromHref(href: string): string {
  const m = href.match(/\/entity\/([a-z]+)(?:\/|$|\?)/i);
  return m ? m[1].toLowerCase() : "product";
}

/**
 * Build a `{ meta: {...} }` reference. The entity type is inferred from the
 * href unless given explicitly — pass it explicitly for hrefs that don't carry
 * the entity type in their path (e.g. order states).
 */
export function meta(href: string, type?: string): { meta: MoySkladMeta } {
  return { meta: { href, type: type ?? metaTypeFromHref(href), mediaType: "application/json" } };
}

/** Extract a `.meta.href` from an entity-shaped object, if present. */
export function metaHref(obj: unknown): string | undefined {
  const m = (obj as { meta?: { href?: unknown } } | null)?.meta;
  return typeof m?.href === "string" ? m.href : undefined;
}

// --- Positions (line items), shared by orders/supply/demand/move/returns/... ---

export interface PositionInput {
  assortment_href: string;
  quantity: number;
  price_rubles?: number;
  discount?: number;
  assortment_type?: string;
}

/** Build a document position. Assortment type is inferred from the href. */
export function position(p: PositionInput): Record<string, unknown> {
  const pos: Record<string, unknown> = {
    quantity: p.quantity,
    assortment: meta(p.assortment_href, p.assortment_type),
  };
  if (p.price_rubles !== undefined) pos.price = rubToKop(p.price_rubles);
  if (p.discount !== undefined) pos.discount = p.discount;
  return pos;
}

// --- Filtering ---

export type FilterCondition = [field: string, value: string, operator?: string];

/**
 * Build a MoySklad `filter` parameter value from conditions joined by `;`.
 *
 * MoySklad's filter grammar splits on literal `;` (after one URL-decode on the
 * server), so a value containing `;` would inject extra conditions. There is no
 * grammar-level escape for it, so we reject such values instead of silently
 * corrupting the query. Normal values (INN, phone, names) are unaffected; the
 * returned string is meant to be passed through `URLSearchParams.set`, which
 * handles transport encoding.
 */
export function buildFilter(conditions: FilterCondition[]): string | undefined {
  const parts: string[] = [];
  for (const [field, value, operator = "="] of conditions) {
    if (value === undefined || value === null || value === "") continue;
    if (value.includes(";")) {
      throw new Error(`Filter value for "${field}" must not contain ';' (filter-condition separator).`);
    }
    parts.push(`${field}${operator}${value}`);
  }
  return parts.length ? parts.join(";") : undefined;
}

/** Standard list query string: limit/offset/search/order/expand/filter. */
export function listQuery(opts: {
  limit?: number;
  offset?: number;
  search?: string;
  order?: string;
  expand?: string;
  filter?: string;
}): string {
  const q = new URLSearchParams();
  if (opts.limit !== undefined) q.set("limit", String(opts.limit));
  if (opts.offset !== undefined) q.set("offset", String(opts.offset));
  if (opts.search) q.set("search", opts.search);
  if (opts.order) q.set("order", opts.order);
  if (opts.expand) q.set("expand", opts.expand);
  if (opts.filter) q.set("filter", opts.filter);
  return q.toString();
}

// --- Response formatting ---

interface ListEnvelope {
  meta?: { size?: number };
  rows?: unknown[];
}

/** Format a MoySklad list response as `{ total, <key>: rows.map(mapRow) }`. */
export function formatList(raw: unknown, key: string, mapRow: (row: Record<string, unknown>) => unknown): string {
  const data = (raw ?? {}) as ListEnvelope;
  return json({
    total: data.meta?.size,
    [key]: (data.rows ?? []).map((r) => mapRow((r ?? {}) as Record<string, unknown>)),
  });
}

/** Extract the common document fields, converting `sum` to rubles. */
export function documentFields(raw: unknown): Record<string, unknown> {
  const d = (raw ?? {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {
    id: d.id,
    name: d.name,
    moment: d.moment,
    sum_rubles: kopToRub(d.sum),
    description: d.description,
    created: d.created,
    updated: d.updated,
  };
  const state = d.state as { name?: unknown } | undefined;
  if (state && typeof state.name === "string") out.state = state.name;
  const agent = d.agent as { name?: unknown } | undefined;
  if (agent && typeof agent.name === "string") out.agent = agent.name;
  return out;
}

/** Format a single document (create/get) using the common fields. */
export function formatDocument(raw: unknown): string {
  return json(documentFields(raw));
}

/** Format a document list using the common fields per row. */
export function formatDocumentList(raw: unknown, key = "documents"): string {
  return formatList(raw, key, documentFields);
}

// --- Price types (fixes the empty priceType.href bug) ---

let cachedPriceTypeHref: string | undefined;

/**
 * Resolve the href of the default sale price type, required by MoySklad when a
 * product carries a `salePrices` entry. The list comes from
 * `GET /context/companysettings/pricetype` (the first element is the default).
 * Cached for the process lifetime.
 */
export async function getDefaultPriceTypeHref(): Promise<string> {
  if (cachedPriceTypeHref) return cachedPriceTypeHref;
  const data = await moyskladGet("/context/companysettings/pricetype");
  const list: unknown[] = Array.isArray(data) ? data : ((data as ListEnvelope)?.rows ?? []);
  const href = metaHref(list[0]);
  if (!href) {
    throw new Error(
      "No price type configured in MoySklad. Create one under Settings, or check GET /context/companysettings/pricetype.",
    );
  }
  cachedPriceTypeHref = href;
  return href;
}

/** Test helper: clear the cached default price type. */
export function _resetPriceTypeCache(): void {
  cachedPriceTypeHref = undefined;
}

// --- Shared building blocks for document tools -------------------------------

/** Reusable Zod schema for a document line item (position). */
export const positionInputSchema = z.object({
  assortment_href: z.string().describe("Meta href of the product/variant/service/bundle (assortment)"),
  quantity: z.number().min(0.01).describe("Quantity"),
  price_rubles: z.number().optional().describe("Price per unit in RUBLES (converted to kopecks internally)"),
  discount: z.number().min(0).max(100).optional().describe("Discount percentage"),
});

export interface DocBodyInput {
  organization_href?: string;
  agent_href?: string;
  store_href?: string;
  source_store_href?: string;
  target_store_href?: string;
  positions?: PositionInput[];
  description?: string;
  sum_rubles?: number;
  incoming_number?: string;
  incoming_date?: string;
  extra?: Record<string, unknown>;
}

/**
 * Build a MoySklad document request body from the common fields. Each field is
 * only included when provided; `extra` lets a specific document type add its
 * own fields. Entity types are passed explicitly so they're correct even when
 * an href doesn't carry the type in its path.
 */
export function buildDocBody(p: DocBodyInput): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (p.organization_href) body.organization = meta(p.organization_href, "organization");
  if (p.agent_href) body.agent = meta(p.agent_href, "counterparty");
  if (p.store_href) body.store = meta(p.store_href, "store");
  if (p.source_store_href) body.sourceStore = meta(p.source_store_href, "store");
  if (p.target_store_href) body.targetStore = meta(p.target_store_href, "store");
  if (p.positions?.length) body.positions = p.positions.map(position);
  if (p.description) body.description = p.description;
  if (p.sum_rubles !== undefined) body.sum = rubToKop(p.sum_rubles);
  if (p.incoming_number) body.incomingNumber = p.incoming_number;
  if (p.incoming_date) body.incomingDate = p.incoming_date;
  return { ...body, ...(p.extra ?? {}) };
}

/** GET a document list for an entity type and format it with common fields. */
export async function fetchDocumentList(
  entityType: string,
  opts: { limit?: number; offset?: number; search?: string; order?: string; filter?: string; expand?: string },
  key = "documents",
): Promise<string> {
  const qs = listQuery(opts);
  const result = await moyskladGet(`/entity/${entityType}?${qs}`);
  return formatDocumentList(result, key);
}

/** GET a single document by id (positions expanded) and return it raw. */
export async function fetchDocument(entityType: string, id: string, expand = "positions"): Promise<string> {
  const result = await moyskladGet(`/entity/${entityType}/${id}?expand=${expand}`);
  return json(result);
}
