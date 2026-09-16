import type {
  ParasutListResult,
  ParasutResource,
  ParasutSingleResult,
  RelationshipRef,
} from "./types.js";

/** Pretty-print a value as the text payload every tool returns. */
export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

// --- Pagination -------------------------------------------------------------
//
// Parasut hard-caps page[size] at 25 (default 15). Requesting more errors or is
// silently clamped, so we clamp client-side to keep tools honest.

export const MAX_PAGE_SIZE = 25;

export function clampPageSize(size: number): number {
  if (!Number.isFinite(size)) return 15;
  return Math.min(Math.max(1, Math.trunc(size)), MAX_PAGE_SIZE);
}

// --- Query building ----------------------------------------------------------

/**
 * Build a JSON:API date filter value.
 *
 * Parasut's date filters (filter[issue_date], filter[due_date], ...) accept a
 * `from...to` range (community/JSON:API convention) or a single exact date.
 * Crucially we NEVER emit a one-sided `from...` (the old bug): a missing bound
 * collapses to exact-match on the provided date.
 */
export function dateRangeFilter(from?: string, to?: string): string | undefined {
  if (from && to) return `${from}...${to}`;
  if (from) return from;
  if (to) return to;
  return undefined;
}

export type FilterMap = Record<string, string | number | boolean | undefined>;

/**
 * Standard list query string: page[number]/page[size]/sort/include + filter[*].
 * page[size] is clamped to Parasut's 1..25 range.
 */
export function listQuery(opts: {
  page?: number;
  pageSize?: number;
  sort?: string;
  include?: string;
  filters?: FilterMap;
}): string {
  const q = new URLSearchParams();
  if (opts.page !== undefined) q.set("page[number]", String(opts.page));
  if (opts.pageSize !== undefined) q.set("page[size]", String(clampPageSize(opts.pageSize)));
  if (opts.sort) q.set("sort", opts.sort);
  if (opts.include) q.set("include", opts.include);
  for (const [field, value] of Object.entries(opts.filters ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    q.set(`filter[${field}]`, String(value));
  }
  return q.toString();
}

// --- JSON:API body building --------------------------------------------------

/** Drop keys whose value is undefined (Parasut rejects some explicit nulls). */
export function omitUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k as keyof T] = v as T[keyof T];
  }
  return out;
}

/** A JSON:API relationship reference: `{ data: { id, type } }`. */
export function rel(id: string, type: string): RelationshipRef {
  return { data: { id, type } };
}

/**
 * Build a JSON:API request body `{ data: { type, attributes, relationships } }`.
 * Undefined attributes are stripped; empty attributes/relationships are omitted.
 */
export function jsonApiBody(
  type: string,
  attributes?: Record<string, unknown>,
  relationships?: Record<string, unknown>,
): { data: Record<string, unknown> } {
  const data: Record<string, unknown> = { type };
  if (attributes) {
    const attrs = omitUndefined(attributes);
    if (Object.keys(attrs).length) data.attributes = attrs;
  }
  if (relationships) {
    const rels = omitUndefined(relationships);
    if (Object.keys(rels).length) data.relationships = rels;
  }
  return { data };
}

// --- Response formatting -----------------------------------------------------

/** Flatten a JSON:API resource into `{ id, type, ...attributes }`. */
export function flattenResource(r: ParasutResource | undefined): Record<string, unknown> {
  if (!r) return {};
  return { id: r.id, type: r.type, ...(r.attributes ?? {}) };
}

/**
 * Format a Parasut list response as
 * `{ total_count, total_pages, current_page, <key>: rows.map(mapRow) }`.
 */
export function formatList(
  raw: unknown,
  key: string,
  mapRow: (row: ParasutResource) => unknown = flattenResource,
): string {
  const data = (raw ?? {}) as ParasutListResult;
  return json({
    total_count: data.meta?.total_count,
    total_pages: data.meta?.total_pages,
    current_page: data.meta?.current_page,
    [key]: (data.data ?? []).map(mapRow),
  });
}

/** Format a single-resource response. `raw=true` returns the untouched payload. */
export function formatResource(raw: unknown, rawPassthrough = false): string {
  if (rawPassthrough) return json(raw);
  const data = (raw ?? {}) as ParasutSingleResult;
  return json(flattenResource(data.data));
}
