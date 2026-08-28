import { describe, it, expect, beforeAll } from "vitest";
import { createMcpServer } from "../src/index.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

describe("MCP Server smoke test", () => {
  let client: Client;

  beforeAll(async () => {
    process.env.YOOKASSA_SHOP_ID = "test_shop";
    process.env.YOOKASSA_SECRET_KEY = "test_key";

    const server = createMcpServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    client = new Client({ name: "test-client", version: "1.0.0" });

    await Promise.all([
      server.connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  it("lists exactly 20 tools", async () => {
    const result = await client.listTools();
    expect(result.tools).toHaveLength(20);
  });

  it("has all expected tool names", async () => {
    const result = await client.listTools();
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual([
      "cancel_payment",
      "capture_payment",
      "create_payment",
      "create_payout",
      "create_receipt",
      "create_recurring_payment",
      "create_refund",
      "create_sbp_payment",
      "create_split_payment",
      "create_webhook",
      "delete_webhook",
      "get_payment",
      "get_payout",
      "get_refund",
      "get_shop_info",
      "list_payments",
      "list_receipts",
      "list_refunds",
      "list_webhooks",
      "save_payment_method",
    ]);
  });

  it("each tool has a description", async () => {
    const result = await client.listTools();
    for (const tool of result.tools) {
      expect(tool.description).toBeTruthy();
    }
  });

  it("read tools are annotated readOnly and money tools destructive", async () => {
    const result = await client.listTools();
    const byName = Object.fromEntries(result.tools.map((t) => [t.name, t]));

    expect(byName["get_payment"].annotations?.readOnlyHint).toBe(true);
    expect(byName["list_payments"].annotations?.readOnlyHint).toBe(true);
    expect(byName["get_shop_info"].annotations?.readOnlyHint).toBe(true);

    expect(byName["create_payment"].annotations?.destructiveHint).toBe(true);
    expect(byName["create_payout"].annotations?.destructiveHint).toBe(true);
    expect(byName["create_refund"].annotations?.destructiveHint).toBe(true);
    expect(byName["create_payment"].annotations?.readOnlyHint).toBe(false);
  });

  it("payment/refund/payout tools advertise an output schema", async () => {
    const result = await client.listTools();
    const byName = Object.fromEntries(result.tools.map((t) => [t.name, t]));
    expect(byName["create_payment"].outputSchema).toBeDefined();
    expect(byName["get_payment"].outputSchema).toBeDefined();
    expect(byName["create_refund"].outputSchema).toBeDefined();
    expect(byName["get_payout"].outputSchema).toBeDefined();
  });
});
