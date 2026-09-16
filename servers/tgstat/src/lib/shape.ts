/**
 * Output shapers.
 *
 * TGStat responses are large and noisy (full post HTML, media blobs, image
 * URLs). These helpers curate the payload down to the fields an LLM actually
 * needs, which keeps tool output cheap in tokens and easy to reason about.
 *
 * Every shaper is *tolerant*: it picks known fields when present and silently
 * omits the rest. As a safety net, if nothing matched (e.g. the live response
 * nests fields differently than the docs), the raw object is returned unchanged
 * so data is never lost.
 */

/* Raw API objects are untyped on purpose — `any` keeps the shapers tolerant. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { fromUnix } from "./dates.js";

function pick(obj: any, keys: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!obj || typeof obj !== "object") return out;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) out[key] = obj[key];
  }
  return out;
}

/** Return the shaped object, or the raw one if shaping matched nothing. */
function orRaw(shaped: Record<string, unknown>, raw: any): unknown {
  return Object.keys(shaped).length > 0 ? shaped : raw;
}

const POST_TEXT_LIMIT = 280;

export function shapeChannel(raw: any): unknown {
  const c = raw && typeof raw === "object" && raw.channel ? raw.channel : raw;
  const out = pick(c, [
    "id",
    "tg_id",
    "link",
    "username",
    "title",
    "about",
    "category",
    "country",
    "language",
    "participants_count",
    "ci_index",
    "rkn_verification",
    "peer_type",
  ]);
  const created = fromUnix(c?.created_at);
  if (created) out.created_at = created;
  return orRaw(out, raw);
}

export function shapePost(raw: any): unknown {
  const p = raw && typeof raw === "object" && raw.post ? raw.post : raw;
  const out = pick(p, [
    "id",
    "link",
    "channel_id",
    "views",
    "forwards",
    "shares",
    "comments",
    "reactions",
    "is_deleted",
    "forwarded_from",
  ]);
  const date = fromUnix(p?.date);
  if (date) out.date = date;
  if (typeof p?.text === "string" && p.text.length > 0) {
    out.text = p.text.length > POST_TEXT_LIMIT ? `${p.text.slice(0, POST_TEXT_LIMIT)}…` : p.text;
  }
  if (p?.media && typeof p.media === "object") {
    const media = pick(p.media, ["media_type", "mime_type", "size"]);
    if (Object.keys(media).length) out.media = media;
  }
  return orRaw(out, raw);
}

/** channels/stat — tolerant superset of reach/ERR metrics. */
export function shapeStat(raw: any): unknown {
  const out = pick(raw, [
    "id",
    "title",
    "username",
    "participants_count",
    "avg_post_reach",
    "adv_post_reach",
    "err_percent",
    "err24_percent",
    "err",
    "daily_reach",
    "ci_index",
    "mentions_count",
    "forwards_count",
    "posts_count",
  ]);
  return orRaw(out, raw);
}

/**
 * List response shaper. Maps `items` through `mapItem` and keeps the count
 * fields. Handles both `{count,total_count,items:[...]}` and a bare array.
 */
export function shapeList(raw: any, mapItem: (item: any) => unknown): Record<string, unknown> {
  const items: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  const out: Record<string, unknown> = { items: items.map(mapItem) };
  if (typeof raw?.count === "number") out.count = raw.count;
  if (typeof raw?.total_count === "number") out.total_count = raw.total_count;
  return out;
}

/** Time-series (subscribers/views/avg-reach/err) — small, returned as-is. */
export function shapeHistory(raw: any): unknown {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.items)) return raw.items;
  return raw;
}

/**
 * Like {@link shapeList}, but passes the raw payload through unchanged when no
 * recognizable item array is found. Use for endpoints whose exact response shape
 * is not pinned down, so unexpected structures are never silently emptied.
 */
export function shapeMaybeList(raw: any, mapItem: (item: any) => unknown): unknown {
  const arr: any[] | null = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : Array.isArray(raw?.mentions)
        ? raw.mentions
        : null;
  if (!arr) return raw;
  const out: Record<string, unknown> = { items: arr.map(mapItem) };
  if (typeof raw?.count === "number") out.count = raw.count;
  if (typeof raw?.total_count === "number") out.total_count = raw.total_count;
  return out;
}
