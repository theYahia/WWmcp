import { z } from "zod";

// A Megaplan entity id. Constrained so a value interpolated into a request URL
// path (e.g. /task/{id}, /{type}/{subject_id}/comments) can't smuggle in path
// traversal — the callers here are LLM agents, so ids are an untrusted boundary.
export const idSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid Megaplan id (letters, digits, _ or - only)");

// Builders for Megaplan API v3 request shapes.
//
// v3 list endpoints do NOT use flat `filter[field]=value` query params or
// `offset`. Instead they take a single JSON object (limit + a nested *Filter
// object + a `pageAfter` cursor) serialized into the query string. See
// src/client.ts `megaplanGet` for the serialization, and the README for the
// background. Filter/term structure is mirrored from the official RAML and the
// stvoidit/megaplan (Go, v3) and zloykolobok/megaplan3 (PHP) clients.

export interface RefSpec {
  /** Entity field to filter on, e.g. "responsible" or "department". */
  field: string;
  /** Referenced entity contentType, e.g. "Employee" or "Department". */
  contentType: string;
  id: string;
}

export interface ListQueryOpts {
  /** Entity contentType base, used for the filter type and the cursor, e.g. "Task". */
  entity: string;
  limit: number;
  /** Cursor: id of the last item from the previous page. */
  pageAfter?: string;
  /** Status enum code(s), e.g. ["filter_any"]. Account-specific. */
  status?: string | string[];
  /** Reference filters (responsible, department, ...). */
  refs?: RefSpec[];
  /** Free-text search. */
  search?: string;
  /** Override for the filter contentType (defaults to `${entity}Filter`). */
  filterContentType?: string;
}

type Json = Record<string, unknown>;

/** Build the v3 list-query object (limit + filter + cursor). */
export function buildListQuery(opts: ListQueryOpts): Json {
  const query: Json = { limit: opts.limit };

  const terms: Json[] = [];
  const status =
    opts.status == null ? [] : Array.isArray(opts.status) ? opts.status : [opts.status];
  if (status.length > 0) {
    terms.push({
      contentType: "FilterTermEnum",
      field: "status",
      comparison: "equals",
      value: status,
    });
  }
  for (const ref of opts.refs ?? []) {
    if (!ref.id) continue;
    terms.push({
      contentType: "FilterTermRef",
      field: ref.field,
      comparison: "equals",
      value: [{ id: ref.id, contentType: ref.contentType }],
    });
  }
  if (terms.length > 0) {
    query.filter = {
      // TODO(live-verify): per-entity filter contentType (e.g. Deal may be
      // "TradeFilter" rather than "DealFilter") — confirm against the account RAML.
      contentType: opts.filterContentType ?? `${opts.entity}Filter`,
      id: null,
      config: {
        contentType: "FilterConfig",
        termGroup: { contentType: "FilterTermGroup", join: "and", terms },
      },
    };
  }

  // TODO(live-verify): free-text search param name (q vs search vs a string
  // filter term). `q` is the documented-likely candidate.
  if (opts.search) query.q = opts.search;

  if (opts.pageAfter) {
    query.pageAfter = { contentType: opts.entity, id: opts.pageAfter };
  }

  return query;
}

/** v3 date+time value object (deadlines etc. are entity objects, not bare strings). */
export function toDateTime(iso: string): Json {
  return { contentType: "DateTime", value: iso };
}

/** v3 Money value object (money fields are complex objects, not bare numbers). */
export function toMoney(value: number, currency = "RUB"): Json {
  // TODO(live-verify): the API may also require `valueInMain`.
  return { contentType: "Money", value, currency };
}
