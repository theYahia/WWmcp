import type { ZodRawShape } from "zod";
import type { TochkaBankClient } from "../client.js";
import { redact } from "../redact.js";

export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
}

export interface ToolDef {
  name: string;
  config: {
    title?: string;
    description: string;
    inputSchema?: ZodRawShape;
    outputSchema?: ZodRawShape;
    annotations?: ToolAnnotations;
  };
  // biome-ignore lint/suspicious/noExplicitAny: tool args are validated by their own zod inputSchema at the MCP boundary.
  handler: (client: TochkaBankClient, args: any) => Promise<ToolResult>;
}

/** Return a tool result carrying both a text rendering and structured content. */
export function jsonResult(structured: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(structured, null, 2) }],
    structuredContent: structured,
  };
}

/**
 * Wrap a tool handler so any thrown error becomes a redacted MCP error result
 * ({ isError: true }) instead of bubbling up as a protocol-level exception.
 */
export function wrapTool(client: TochkaBankClient, tool: ToolDef) {
  return async (args: Record<string, unknown>): Promise<ToolResult> => {
    try {
      return await tool.handler(client, args);
    } catch (err) {
      const message = redact(err instanceof Error ? err.message : String(err));
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${message}` }],
      };
    }
  };
}
