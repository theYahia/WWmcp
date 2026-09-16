import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer, TOOL_COUNT } from "../src/server.js";

const EXPECTED_TOOLS = [
  "add_blacklist",
  "cancel_order",
  "delete_blacklist",
  "get_balance",
  "get_blacklist",
  "get_report",
  "get_reports",
  "get_sender",
  "iys_check",
  "iys_register",
  "send_sms",
];

function mockFetch(status: number, body: unknown) {
  const mock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

/** The `request.order` object the server sent on the last send_sms call. */
function sentOrder(fetchMock: ReturnType<typeof mockFetch>): Record<string, any> {
  return JSON.parse(fetchMock.mock.calls[0][1].body).request.order;
}

describe("ileti-merkezi server factory", () => {
  let client: Client;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env["ILETIMERKEZI_API_KEY"] = "panel-key";
    process.env["ILETIMERKEZI_API_HASH"] = "panel-hash";

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    client = new Client({ name: "test-client", version: "1.0.0" });
    await Promise.all([
      createServer().connect(serverTransport),
      client.connect(clientTransport),
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  afterAll(async () => {
    await client.close();
    process.env = { ...originalEnv };
  });

  it(`registers exactly ${TOOL_COUNT} tools, matching TOOL_COUNT`, async () => {
    const { tools } = await client.listTools();
    expect(TOOL_COUNT).toBe(11);
    expect(tools).toHaveLength(TOOL_COUNT);
    expect(tools.map((t) => t.name).sort()).toEqual(EXPECTED_TOOLS);
  });

  it("send_sms wraps a single number in the receipents array", async () => {
    const fetchMock = mockFetch(200, { response: { status: { code: 200 }, order: { id: 7 } } });
    const result: any = await client.callTool({
      name: "send_sms",
      arguments: { to: "5551234567", message: "kod: 1234", sender: "APITEST" },
    });
    expect(result.isError).toBeFalsy();
    expect(sentOrder(fetchMock).message.receipents.number).toEqual(["5551234567"]);
    expect(result.content[0].text).toContain("Order ID: 7");
  });

  it("send_sms sends an array of numbers as one bulk order", async () => {
    const fetchMock = mockFetch(200, { response: { status: { code: 200 }, order: { id: 8 } } });
    await client.callTool({
      name: "send_sms",
      arguments: { to: ["5551234567", "5339876543"], message: "hi", sender: "APITEST" },
    });
    expect(sentOrder(fetchMock).message.receipents.number).toHaveLength(2);
  });

  it("message_type drives the İYS flag (transactional 0 / commercial 1)", async () => {
    const transactional = mockFetch(200, { response: { status: { code: 200 } } });
    await client.callTool({
      name: "send_sms",
      arguments: { to: "5551234567", message: "kod", sender: "APITEST" },
    });
    expect(sentOrder(transactional).iys).toBe("0");
    vi.restoreAllMocks();

    const commercial = mockFetch(200, { response: { status: { code: 200 } } });
    await client.callTool({
      name: "send_sms",
      arguments: {
        to: "5551234567",
        message: "indirim",
        sender: "APITEST",
        message_type: "commercial",
      },
    });
    expect(sentOrder(commercial).iys).toBe("1");
  });

  it("send_sms fails cleanly when no sender header is available", async () => {
    mockFetch(200, {});
    const result: any = await client.callTool({
      name: "send_sms",
      arguments: { to: "5551234567", message: "hi" },
    });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("No sender header");
  });

  it("surfaces a failing API status code as isError with guidance", async () => {
    mockFetch(401, { response: { status: { code: 401, message: "Unauthorized" } } });
    const result: any = await client.callTool({ name: "get_balance", arguments: {} });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Authentication failed (401)");
  });

  it("rejects a non-Turkish mobile number before it costs a call", async () => {
    const fetchMock = mockFetch(200, {});
    const result: any = await client.callTool({
      name: "send_sms",
      arguments: { to: "+15551234567", message: "hi", sender: "APITEST" },
    });
    expect(result.isError).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
