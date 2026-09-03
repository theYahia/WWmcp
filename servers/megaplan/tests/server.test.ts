import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, TOOL_COUNT, PROMPT_COUNT } from "../src/server.js";

const EXPECTED_TOOLS = [
  "create_comment",
  "create_deal",
  "create_task",
  "get_client",
  "get_comments",
  "get_current_user",
  "get_deal",
  "get_deal_program",
  "get_deal_programs",
  "get_deals",
  "get_employees",
  "get_project",
  "get_projects",
  "get_task",
  "get_tasks",
  "list_clients",
  "update_deal",
  "update_task",
];

describe("megaplan server factory", () => {
  let client: Client;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env["MEGAPLAN_DOMAIN"] = "acme";
    process.env["MEGAPLAN_TOKEN"] = "test-token";

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "test-client", version: "1.0.0" });
    await Promise.all([
      createServer().connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterAll(async () => {
    await client.close();
    process.env = { ...originalEnv };
  });

  it(`registers exactly ${TOOL_COUNT} tools, matching TOOL_COUNT`, async () => {
    const { tools } = await client.listTools();
    expect(TOOL_COUNT).toBe(18);
    expect(tools).toHaveLength(TOOL_COUNT);
    expect(tools.map((t) => t.name).sort()).toEqual(EXPECTED_TOOLS);
  });

  it(`registers ${PROMPT_COUNT} prompts (not counted as tools)`, async () => {
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p) => p.name).sort()).toEqual(["create-deal-wizard", "my-tasks-today"]);
    expect(prompts).toHaveLength(PROMPT_COUNT);
  });

  it("every tool carries a usable description and input schema", async () => {
    const { tools } = await client.listTools();
    for (const tool of tools) {
      expect((tool.description ?? "").length).toBeGreaterThanOrEqual(20);
      expect(tool.inputSchema).toBeTruthy();
    }
  });
});
