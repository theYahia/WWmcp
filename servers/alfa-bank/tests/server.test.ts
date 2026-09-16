import { beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/index.js";

const EXPECTED_TOOLS = [
  "create_payment_order",
  "get_account_balance",
  "get_account_statement",
  "get_exchange_rates",
  "get_payment_status",
  "get_salary_registry",
  "list_accounts",
  "list_counterparties",
];

describe("MCP server smoke test", () => {
  let client: Client;

  beforeAll(async () => {
    process.env.ALFA_CLIENT_ID = "test-id";
    process.env.ALFA_CLIENT_SECRET = "test-secret";

    const server = createMcpServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  });

  it("lists exactly 8 tools", async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(8);
  });

  it("exposes the expected tool names", async () => {
    const result = await client.listTools();
    expect(result.tools.map((t) => t.name).sort()).toEqual(EXPECTED_TOOLS);
  });

  it("every tool has a description", async () => {
    const result = await client.listTools();
    for (const tool of result.tools) {
      expect(tool.description).toBeTruthy();
    }
  });

  it("annotates create_payment_order as destructive (not read-only)", async () => {
    const result = await client.listTools();
    const payment = result.tools.find((t) => t.name === "create_payment_order");
    expect(payment?.annotations?.destructiveHint).toBe(true);
    expect(payment?.annotations?.readOnlyHint).toBe(false);
  });

  it("annotates read tools as read-only", async () => {
    const result = await client.listTools();
    for (const name of EXPECTED_TOOLS.filter((n) => n !== "create_payment_order")) {
      const tool = result.tools.find((t) => t.name === name);
      expect(tool?.annotations?.readOnlyHint).toBe(true);
    }
  });
});
