import type { ZodRawShape } from "zod";
import type {
  ToolAnnotations,
  CallToolResult,
} from "@modelcontextprotocol/sdk/types.js";
import { withErrorHandling } from "@theyahia/mcp-core";

/**
 * A self-describing tool registration. Each tool module exports one or more of
 * these; `server.ts` maps over them into `server.registerTool(...)` so the
 * registration site stays a single loop instead of N inline calls.
 */
export interface ToolDescriptor {
  /** Tool id, e.g. `create_payment_intent`. */
  name: string;
  /** Human-friendly display name shown by MCP clients. */
  title: string;
  /** What the tool does (shown to the model). */
  description: string;
  /** Zod raw shape (`schema.shape`) used as the input schema. */
  inputSchema: ZodRawShape;
  /** Behavioural hints (readOnly/destructive/idempotent/openWorld). */
  annotations?: ToolAnnotations;
  /** Business logic: validated params in, a text result out. */
  handler: (params: any) => Promise<string>;
}

/**
 * Wrap a `(params) => Promise<string>` handler into an MCP tool callback via
 * mcp-core's `withErrorHandling`: success becomes a text content block, any
 * thrown error becomes `isError: true` (the PayMongoError message is kept as
 * "Детали"), and both paths pass the core prompt-injection filter + truncation.
 */
export function tool<T>(
  handler: (params: T) => Promise<string>,
): (params: T) => Promise<CallToolResult> {
  return withErrorHandling<T>(async (params) => ({
    content: [{ type: "text", text: await handler(params) }],
  }));
}
