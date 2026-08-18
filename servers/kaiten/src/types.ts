import type { z } from "zod";

/**
 * A single MCP tool: its name, description, Zod input schema and handler.
 * Tool modules export an array of these; `index.ts` registers them in a loop,
 * so the tool count is derived, never hardcoded.
 */
export interface ToolDef {
  name: string;
  description: string;
  schema: z.ZodObject<z.ZodRawShape>;
  // Handlers receive validated params (typed via z.infer at each module's call site).
  handler: (params: any) => Promise<string>;
}

// --- Kaiten domain shapes (partial — used by the projection helpers in lib.ts) ---
//
// Kaiten returns large objects with dozens of fields. These interfaces capture
// only the fields the compact projections read; everything else is preserved
// when a tool returns full JSON (get_*/mutations).

export interface KaitenUserRef {
  id: number;
  full_name?: string;
  username?: string;
  email?: string;
}

export interface KaitenSpace {
  id: number;
  title?: string;
  archived?: boolean;
  created?: string;
}

export interface KaitenColumn {
  id: number;
  title?: string;
  type?: number;
  sort_order?: number;
  board_id?: number;
}

export interface KaitenLane {
  id: number;
  title?: string;
  sort_order?: number;
  board_id?: number;
}

export interface KaitenBoard {
  id: number;
  title?: string;
  description?: string;
  space_id?: number;
  columns?: KaitenColumn[];
  lanes?: KaitenLane[];
}

export interface KaitenCard {
  id: number;
  title?: string;
  description?: string;
  column_id?: number;
  lane_id?: number;
  board_id?: number;
  owner?: KaitenUserRef;
  members?: KaitenUserRef[];
  state?: number;
  archived?: boolean;
  condition?: number;
  due_date?: string;
  asap?: boolean;
  size_text?: string;
  created?: string;
  updated?: string;
}

export interface KaitenTag {
  id: number;
  name?: string;
  color?: number;
}

export interface KaitenComment {
  id: number;
  text?: string;
  author?: KaitenUserRef;
  created?: string;
  updated?: string;
}

export interface KaitenChecklist {
  id: number;
  name?: string;
  items?: Array<{ id: number; text?: string; checked?: boolean }>;
}
