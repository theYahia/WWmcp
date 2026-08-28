import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer, TOOL_NAMES, TOOL_COUNT } from "../src/server.js";

async function connectedClient() {
  const server = createMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { server, client };
}

describe("MCP server", () => {
  it(`registers exactly ${TOOL_COUNT} tools with the expected names`, async () => {
    const { server, client } = await connectedClient();
    const { tools } = await client.listTools();
    expect(tools).toHaveLength(TOOL_COUNT);
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    await client.close();
    await server.close();
  });

  describe("error surfacing", () => {
    beforeEach(() => {
      delete process.env.TILDA_PUBLIC_KEY;
      delete process.env.TILDA_SECRET_KEY;
    });
    afterEach(() => {
      delete process.env.TILDA_PUBLIC_KEY;
      delete process.env.TILDA_SECRET_KEY;
    });

    it("returns isError content (not a protocol error) when credentials are missing", async () => {
      const { server, client } = await connectedClient();
      const result = await client.callTool({ name: "get_projects", arguments: {} });
      expect(result.isError).toBe(true);
      const text = (result.content as Array<{ type: string; text: string }>)[0].text;
      expect(text).toContain("TILDA_PUBLIC_KEY");
      await client.close();
      await server.close();
    });
  });
});
