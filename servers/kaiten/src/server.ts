/**
 * Kaiten MCP server factory.
 *
 * Tool modules export ToolDef arrays; they are registered in a loop, so the
 * tool count is derived, never hardcoded (63 at 4.0.0).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { withErrorHandling } from "@theyahia/mcp-core";
import { VERSION } from "./version.js";
import type { ToolDef } from "./types.js";

import { tools as spaceTools } from "./tools/spaces.js";
import { tools as boardTools } from "./tools/boards.js";
import { tools as columnTools } from "./tools/columns.js";
import { tools as laneTools } from "./tools/lanes.js";
import { tools as cardTools } from "./tools/cards.js";
import { tools as commentTools } from "./tools/card_comments.js";
import { tools as memberTools } from "./tools/card_members.js";
import { tools as cardTagTools } from "./tools/card_tags.js";
import { tools as childTools } from "./tools/card_children.js";
import { tools as externalLinkTools } from "./tools/card_external_links.js";
import { tools as blockerTools } from "./tools/card_blockers.js";
import { tools as checklistTools } from "./tools/card_checklists.js";
import { tools as tagTools } from "./tools/tags.js";
import { tools as userTools } from "./tools/users.js";
import { tools as cardTypeTools } from "./tools/card_types.js";
import { tools as sprintTools } from "./tools/sprints.js";
import { tools as customPropertyTools } from "./tools/custom_properties.js";

export const allTools: ToolDef[] = [
  ...spaceTools,
  ...boardTools,
  ...columnTools,
  ...laneTools,
  ...cardTools,
  ...commentTools,
  ...memberTools,
  ...cardTagTools,
  ...childTools,
  ...externalLinkTools,
  ...blockerTools,
  ...checklistTools,
  ...tagTools,
  ...userTools,
  ...cardTypeTools,
  ...sprintTools,
  ...customPropertyTools,
];

export const TOOL_COUNT = allTools.length;

export function createServer(): McpServer {
  const server = new McpServer({ name: "kaiten-mcp", version: VERSION });

  const seen = new Set<string>();
  for (const t of allTools) {
    if (seen.has(t.name)) throw new Error(`Duplicate tool name: ${t.name}`);
    seen.add(t.name);
    server.tool(
      t.name,
      t.description,
      t.schema.shape,
      withErrorHandling(async (params) => ({
        content: [{ type: "text", text: await t.handler(params) }],
      })),
    );
  }

  return server;
}
