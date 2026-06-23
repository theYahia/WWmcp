/**
 * Wildberries MCP server factory.
 *
 * Tools are declared as JSON Schema in tools.ts and converted to a Zod raw
 * shape here (`jsonPropToZod` honours enum / integer / min / max / min-maxItems),
 * which is what McpServer.tool() expects and which validates tool inputs for free.
 *
 * Note: WBClient + RateLimiter are kept custom (not @theyahia/mcp-core's
 * BaseHttpClient) — they implement Wildberries' per-category rate limiting and
 * 409 penalty handling (X-Ratelimit-Retry-After), and per-host routing.
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
    case "string": {
      const enumVals = prop["enum"] as string[] | undefined;
      zodType =
        enumVals && enumVals.length > 0
          ? z.enum(enumVals as [string, ...string[]])
          : z.string();
      break;
    }
    case "number":
    case "integer": {
      let n = type === "integer" ? z.number().int() : z.number();
      if (typeof prop["minimum"] === "number") n = n.min(prop["minimum"] as number);
      if (typeof prop["maximum"] === "number") n = n.max(prop["maximum"] as number);
      zodType = n;
      break;
    }
    case "boolean":
      zodType = z.boolean();
      break;
    case "array": {
      const items = prop["items"] as Record<string, unknown> | undefined;
      let arr = z.array(items ? jsonPropToZod(items) : z.unknown());
      if (typeof prop["minItems"] === "number") arr = arr.min(prop["minItems"] as number);
      if (typeof prop["maxItems"] === "number") arr = arr.max(prop["maxItems"] as number);
      zodType = arr;
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
    version: "3.1.0",
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
