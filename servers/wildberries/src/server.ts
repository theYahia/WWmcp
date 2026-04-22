/**
 * Wildberries MCP server factory.
 *
 * Note: tools.ts uses raw JSON Schema (not Zod) — preserved as-is in v2.0.0.
 * Migration to Zod-defined schemas is deferred (no functional benefit; both
 * formats are accepted by McpServer.tool()).
 *
 * Note: WBClient + RateLimiter from v1 are preserved as-is — they implement
 * Wildberries-specific 409 penalty handling (X-Ratelimit-Retry-After header)
 * that doesn't fit @theyahia/mcp-core's BaseHttpClient generic retry pattern.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, type ZodTypeAny } from "zod";
import { createLogger } from "@theyahia/mcp-core";
import { WBClient } from "./client.js";
import { toolDefinitions, handleTool, type ToolName } from "./tools.js";

export const logger = createLogger("wildberries-mcp");

export const TOOL_COUNT = Object.keys(toolDefinitions).length;

/**
 * Convert one JSON Schema property definition to a Zod type. Only the subset
 * used by Wildberries tools is supported (string / number / boolean / array /
 * nested object). Required vs optional is handled by the caller via the
 * `required` array on the parent object schema.
 */
function jsonPropToZod(prop: Record<string, unknown>): ZodTypeAny {
  const type = prop["type"] as string;
  const description = prop["description"] as string | undefined;
  let zodType: ZodTypeAny;

  switch (type) {
    case "string":
      zodType = z.string();
      break;
    case "number":
      zodType = z.number();
      break;
    case "boolean":
      zodType = z.boolean();
      break;
    case "array": {
      const items = prop["items"] as Record<string, unknown> | undefined;
      zodType = z.array(items ? jsonPropToZod(items) : z.unknown());
      break;
    }
    case "object": {
      const props = prop["properties"] as Record<string, Record<string, unknown>> | undefined;
      const required = (prop["required"] as string[] | undefined) ?? [];
      const shape: Record<string, ZodTypeAny> = {};
      if (props) {
        for (const [k, v] of Object.entries(props)) {
          const zt = jsonPropToZod(v);
          shape[k] = required.includes(k) ? zt : zt.optional();
        }
      }
      zodType = z.object(shape);
      break;
    }
    default:
      zodType = z.unknown();
  }

  return description ? zodType.describe(description) : zodType;
}

/**
 * Convert a tool's top-level inputSchema (object) to a Zod raw shape that
 * McpServer.tool() expects.
 */
function toolSchemaToZodShape(
  inputSchema: {
    readonly properties?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
    readonly required?: readonly string[];
  },
): Record<string, ZodTypeAny> {
  const shape: Record<string, ZodTypeAny> = {};
  const required = inputSchema.required ?? [];
  if (!inputSchema.properties) return shape;
  for (const [name, propDef] of Object.entries(inputSchema.properties)) {
    const zt = jsonPropToZod(propDef);
    shape[name] = required.includes(name) ? zt : zt.optional();
  }
  return shape;
}

export function createServer(client?: WBClient): McpServer {
  // Allow injection for testing; otherwise read env at server creation time
  const wbClient =
    client ??
    new WBClient({
      token: process.env["WB_API_TOKEN"] ?? "",
    });

  const server = new McpServer({
    name: "wildberries-mcp",
    version: "2.0.0",
  });

  for (const [name, def] of Object.entries(toolDefinitions)) {
    const toolName = name as ToolName;
    server.tool(
      toolName,
      def.description,
      toolSchemaToZodShape(def.inputSchema),
      async (args: Record<string, unknown>) => {
        try {
          const result = await handleTool(wbClient, toolName, args);
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return {
            content: [{ type: "text" as const, text: `Error: ${message}` }],
            isError: true,
          };
        }
      },
    );
  }

  return server;
}
