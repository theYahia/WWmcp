import { describe, it, expect, vi } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

// Mock env before importing
vi.stubEnv("POCHTA_TOKEN", "test-token");
vi.stubEnv("POCHTA_KEY", "test-key");

const TOOL_NAMES = [
  "calculate",
  "delivery_time",
  "get_offices",
  "normalize_address",
  "track",
  "zip_lookup",
];

describe("Server creation", () => {
  it("creates server with 6 tools", async () => {
    const { createServer, TOOL_COUNT } = await import("../src/index.js");
    const server = createServer();
    expect(server).toBeDefined();
    expect(TOOL_COUNT).toBe(6);
  });

  it("lists exactly the 6 expected tools over an in-memory transport", async () => {
    const { createServer } = await import("../src/index.js");
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test", version: "1.0.0" });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([...TOOL_NAMES].sort());
    for (const t of tools) expect(t.inputSchema.type).toBe("object");

    await client.close();
    await server.close();
  });
});

describe("Client auth", () => {
  it("accepts POCHTA_TOKEN + POCHTA_KEY", async () => {
    vi.stubEnv("POCHTA_TOKEN", "my-token");
    vi.stubEnv("POCHTA_KEY", "my-key");
    // Clear cached modules
    vi.resetModules();
    const { PochtaClient } = await import("../src/client.js");
    const client = new PochtaClient();
    expect(client).toBeDefined();
  });

  it("accepts legacy POCHTA_LOGIN + POCHTA_PASSWORD + POCHTA_TOKEN", async () => {
    vi.stubEnv("POCHTA_TOKEN", "my-token");
    vi.stubEnv("POCHTA_KEY", "");
    vi.stubEnv("POCHTA_LOGIN", "user");
    vi.stubEnv("POCHTA_PASSWORD", "pass");
    vi.resetModules();
    const { PochtaClient } = await import("../src/client.js");
    const client = new PochtaClient();
    expect(client).toBeDefined();
  });

  it("throws without credentials", async () => {
    vi.stubEnv("POCHTA_TOKEN", "");
    vi.stubEnv("POCHTA_KEY", "");
    vi.stubEnv("POCHTA_LOGIN", "");
    vi.stubEnv("POCHTA_PASSWORD", "");
    vi.resetModules();
    const { PochtaClient } = await import("../src/client.js");
    expect(() => new PochtaClient()).toThrow("Требуется авторизация");
  });
});

describe("SOAP parser", () => {
  it("parses tracking XML with events", async () => {
    vi.stubEnv("POCHTA_TOKEN", "t");
    vi.stubEnv("POCHTA_KEY", "k");
    vi.resetModules();
    const { PochtaClient } = await import("../src/client.js");
    const client = new PochtaClient();

    const xml = `
    <historyRecord>
      <OperType><Name>Приём</Name></OperType>
      <OperAttr><Name>Единичный</Name></OperAttr>
      <OperDate>2024-01-15T10:30:00</OperDate>
      <OperationAddress><Description>Москва</Description></OperationAddress>
    </historyRecord>
    <historyRecord>
      <OperType><Name>Вручение</Name></OperType>
      <OperAttr><Name>Вручение адресату</Name></OperAttr>
      <OperDate>2024-01-20T14:00:00</OperDate>
      <OperationAddress><Description>Новосибирск</Description></OperationAddress>
    </historyRecord>`;

    // Access private method via any
    const result = (client as any).parseSoapTracking(xml, "RA123456789RU");
    expect(result.трек_номер).toBe("RA123456789RU");
    expect(result.все_события).toHaveLength(2);
    expect(result.все_события[0].операция).toBe("Приём");
    expect(result.все_события[1].место).toBe("Новосибирск");
    expect(result.последний_статус.операция).toBe("Вручение");
  });

  it("handles empty tracking response", async () => {
    vi.stubEnv("POCHTA_TOKEN", "t");
    vi.stubEnv("POCHTA_KEY", "k");
    vi.resetModules();
    const { PochtaClient } = await import("../src/client.js");
    const client = new PochtaClient();
    const result = (client as any).parseSoapTracking("<empty/>", "XX000000000XX");
    expect(result.сообщение).toContain("не найдена");
  });
});
