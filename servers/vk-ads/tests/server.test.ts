import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, TOOL_COUNT } from "../src/server.js";

const EXPECTED_TOOLS = [
  "create_ad",
  "create_campaign",
  "get_account",
  "get_statistics",
  "list_ad_groups",
  "list_ads",
  "list_campaigns",
  "update_campaign",
];

describe("vk-ads server factory", () => {
  let client: Client;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env["VK_ADS_TOKEN"] = "test-token";
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
    expect(TOOL_COUNT).toBe(8);
    expect(tools).toHaveLength(TOOL_COUNT);
    expect(tools.map((t) => t.name).sort()).toEqual(EXPECTED_TOOLS);
  });

  it("drops the tools that had no v2 endpoint", async () => {
    const names = (await client.listTools()).tools.map((t) => t.name);
    expect(names).not.toContain("get_budget");
    expect(names).not.toContain("list_targeting_groups");
  });

  it("marks read tools readOnly and mutations write", async () => {
    const byName = new Map((await client.listTools()).tools.map((t) => [t.name, t]));
    expect(byName.get("list_campaigns")?.annotations?.readOnlyHint).toBe(true);
    expect(byName.get("create_campaign")?.annotations?.readOnlyHint).toBe(false);
    expect(byName.get("update_campaign")?.annotations?.destructiveHint).toBe(true);
  });

  it("every tool carries a usable description and input schema", async () => {
    for (const tool of (await client.listTools()).tools) {
      expect((tool.description ?? "").length).toBeGreaterThanOrEqual(20);
      expect(tool.inputSchema).toBeTruthy();
    }
  });
});
