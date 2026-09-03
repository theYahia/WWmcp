// Maps raw, verbose Megaplan v3 entities into the compact shapes in types.ts.
//
// All accessors are defensive (optional chaining + fallbacks): the exact v3
// field set varies by account, so an unknown/renamed field yields null rather
// than throwing. Every tool also exposes a `raw` escape hatch to bypass this.

import type {
  MegaplanTask,
  MegaplanDeal,
  MegaplanProject,
  MegaplanEmployee,
  MegaplanComment,
  MegaplanProgram,
  MegaplanClient,
  MegaplanListSummary,
} from "./types.js";

type Rec = Record<string, any>;

function rec(v: unknown): Rec {
  return v && typeof v === "object" ? (v as Rec) : {};
}
function str(v: unknown): string | undefined {
  return v == null ? undefined : String(v);
}
/** A Megaplan reference object {id, contentType, name?} -> display string. */
function refName(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  const r = rec(v);
  return r.name ?? (r.id != null ? String(r.id) : null);
}
/** An enum/status value (string code or {name|value|code}) -> display string. */
function enumName(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  const r = rec(v);
  return r.name ?? r.value ?? r.code ?? null;
}
/** A DateTime/DateOnly object {value} (or a bare string) -> string. */
function dateVal(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v;
  const r = rec(v);
  return r.value ?? null;
}
/** A Money object {value, currency} (or a bare number) -> display string. */
function money(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "number") return String(v);
  const r = rec(v);
  if (r.value == null) return null;
  return r.currency ? `${r.value} ${r.currency}` : String(r.value);
}

export function formatTask(e: unknown): MegaplanTask {
  const t = rec(e);
  return {
    id: str(t.id) ?? "",
    name: t.name,
    status: enumName(t.status),
    responsible: refName(t.responsible),
    deadline: dateVal(t.deadline),
    priority: enumName(t.priority),
    created: dateVal(t.timeCreated ?? t.created),
    modified: dateVal(t.timeUpdated ?? t.modified),
  };
}

export function formatDeal(e: unknown): MegaplanDeal {
  const d = rec(e);
  return {
    id: str(d.id) ?? "",
    name: d.name,
    status: enumName(d.status ?? d.state),
    price: money(d.price),
    cost: money(d.cost),
    responsible: refName(d.responsible),
    contact: refName(d.contact),
    contractor: refName(d.contractor),
    created: dateVal(d.timeCreated ?? d.created),
    modified: dateVal(d.timeUpdated ?? d.modified),
  };
}

export function formatProject(e: unknown): MegaplanProject {
  const p = rec(e);
  return {
    id: str(p.id) ?? "",
    name: p.name,
    status: enumName(p.status),
    responsible: refName(p.responsible),
    created: dateVal(p.timeCreated ?? p.created),
    modified: dateVal(p.timeUpdated ?? p.modified),
  };
}

export function formatEmployee(e: unknown): MegaplanEmployee {
  const m = rec(e);
  return {
    id: str(m.id) ?? "",
    name: m.name ?? refName(m),
    email: m.email ?? null,
    department: refName(m.department),
    position: enumName(m.position),
  };
}

export function formatComment(e: unknown): MegaplanComment {
  const c = rec(e);
  return {
    id: str(c.id) ?? "",
    content: c.content ?? c.text ?? null,
    author: refName(c.author),
    created: dateVal(c.timeCreated ?? c.created),
  };
}

export function formatProgram(e: unknown): MegaplanProgram {
  const p = rec(e);
  return { id: str(p.id) ?? "", name: p.name };
}

export function formatClient(e: unknown): MegaplanClient {
  const c = rec(e);
  return {
    id: str(c.id) ?? "",
    name: c.name ?? refName(c),
    email: c.email ?? null,
    phone: enumName(c.phone) ?? null,
    type: c.contentType ?? null,
  };
}

/** Unwrap a v3 `{meta, data}` list envelope into a compact summary string. */
export function formatList<T>(
  result: unknown,
  formatter: (e: unknown) => T,
  raw?: boolean,
): string {
  if (raw) return JSON.stringify(result, null, 2);
  const r = rec(result);
  const data: unknown[] = Array.isArray(r.data) ? r.data : [];
  const meta = rec(r.meta);
  const pagination = rec(meta.pagination);
  const items = data.map(formatter);
  const last = rec(data[data.length - 1]);
  const summary: MegaplanListSummary<T> = {
    total: meta.totalCount ?? pagination.count ?? items.length,
    count: items.length,
    items,
    nextPageAfter: last.id != null ? String(last.id) : null,
  };
  return JSON.stringify(summary, null, 2);
}

/** Unwrap a v3 `{data: {...}}` single-entity envelope and format it. */
export function formatEntity<T>(
  result: unknown,
  formatter: (e: unknown) => T,
  raw?: boolean,
): string {
  if (raw) return JSON.stringify(result, null, 2);
  const r = rec(result);
  const data = r.data !== undefined ? r.data : r;
  return JSON.stringify(formatter(data), null, 2);
}
