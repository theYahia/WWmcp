import type { z } from "zod";

/** Common MoySklad API list response wrapper */
export interface MoySkladListResult<T> {
  meta: { href: string; type: string; size: number; limit: number; offset: number };
  rows: T[];
}

/** MoySklad meta reference */
export interface MoySkladMeta {
  href: string;
  type: string;
  mediaType: string;
}

/** An object that carries a MoySklad meta reference (entities, documents, refs). */
export interface WithMeta {
  meta?: Partial<MoySkladMeta> & { href?: string };
}

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
