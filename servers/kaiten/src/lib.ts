import type {
  KaitenBoard,
  KaitenCard,
  KaitenChecklist,
  KaitenColumn,
  KaitenComment,
  KaitenLane,
  KaitenSpace,
  KaitenTag,
  KaitenUserRef,
} from "./types.js";

/** Pretty-print a value as the text payload every tool returns. */
export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * Build a `?a=1&b=2` query string from a params object, skipping
 * undefined/null/empty values. Returns "" when nothing is set.
 */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * Format a Kaiten list response (a bare JSON array) as
 * `{ total, <key>: rows.map(project) }`. Non-array payloads pass through
 * unchanged so a tool never breaks on an unexpected envelope.
 */
export function formatList<T>(raw: unknown, key: string, project: (row: T) => unknown): string {
  if (!Array.isArray(raw)) return json(raw);
  return json({ total: raw.length, [key]: raw.map((r) => project(r as T)) });
}

// --- Compact projections ------------------------------------------------------
//
// list_* tools return these slimmed shapes to keep token usage low. get_* and
// mutations return full JSON, since the details matter after the action.

function userRef(u?: KaitenUserRef): { id: number; full_name?: string } | undefined {
  return u ? { id: u.id, full_name: u.full_name } : undefined;
}

export function projectCard(c: KaitenCard): unknown {
  return {
    id: c.id,
    title: c.title,
    board_id: c.board_id,
    column_id: c.column_id,
    lane_id: c.lane_id,
    state: c.state,
    condition: c.condition,
    archived: c.archived,
    due_date: c.due_date,
    owner: userRef(c.owner),
  };
}

export function projectBoard(b: KaitenBoard): unknown {
  return { id: b.id, title: b.title, space_id: b.space_id, description: b.description };
}

export function projectSpace(s: KaitenSpace): unknown {
  return { id: s.id, title: s.title, archived: s.archived };
}

export function projectColumn(c: KaitenColumn): unknown {
  return { id: c.id, title: c.title, type: c.type, sort_order: c.sort_order, board_id: c.board_id };
}

export function projectLane(l: KaitenLane): unknown {
  return { id: l.id, title: l.title, sort_order: l.sort_order, board_id: l.board_id };
}

export function projectUser(u: KaitenUserRef): unknown {
  return { id: u.id, full_name: u.full_name, username: u.username, email: u.email };
}

export function projectTag(t: KaitenTag): unknown {
  return { id: t.id, name: t.name, color: t.color };
}

export function projectComment(c: KaitenComment): unknown {
  return { id: c.id, text: c.text, author: userRef(c.author), created: c.created };
}

export function projectChecklist(c: KaitenChecklist): unknown {
  return {
    id: c.id,
    name: c.name,
    items: (c.items ?? []).map((i) => ({ id: i.id, text: i.text, checked: i.checked })),
  };
}
