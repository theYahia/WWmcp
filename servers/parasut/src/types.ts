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

/** A JSON:API resource object as Parasut returns it (JSON:API 1.0). */
export interface ParasutResource {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
  relationships?: Record<string, unknown>;
}

/** Parasut list response wrapper. */
export interface ParasutListResult {
  data?: ParasutResource[];
  included?: ParasutResource[];
  meta?: ParasutListMeta;
}

/** Pagination meta block on list responses. */
export interface ParasutListMeta {
  current_page?: number;
  total_pages?: number;
  total_count?: number;
}

/** Parasut single-resource response wrapper. */
export interface ParasutSingleResult {
  data?: ParasutResource;
  included?: ParasutResource[];
}

/** A JSON:API relationship reference: `{ data: { id, type } }`. */
export interface RelationshipRef {
  data: { id: string; type: string };
}
