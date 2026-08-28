import { describe, it, expect, vi, beforeEach } from "vitest";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.HUNTFLOW_TOKEN = "test-token";
process.env.HUNTFLOW_TOKEN_FILE = join(tmpdir(), `hf-server-test-${process.pid}.json`);
process.env.HUNTFLOW_DISABLE_RATELIMIT = "1";
process.env.HUNTFLOW_BACKOFF_MS = "0";

import { createServer } from "../src/index.js";

const mockOk = (data: unknown) => ({ ok: true, status: 200, json: async () => data });

async function connectClient() {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "1.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  return client;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("createServer", () => {
  it("возвращает экземпляр McpServer", () => {
    const server = createServer();
    expect(server).toBeDefined();
    expect(typeof server.connect).toBe("function");
  });
});

describe("интеграция через MCP-клиент", () => {
  it("регистрирует 14 тулов и 2 промпта", async () => {
    const client = await connectClient();
    const { tools } = await client.listTools();
    const { prompts } = await client.listPrompts();
    expect(tools).toHaveLength(14);
    expect(prompts).toHaveLength(2);
    expect(tools.map((t) => t.name)).toContain("list_vacancy_applicants");
  });

  it("курируемый тул отдаёт валидный structuredContent (проходит outputSchema)", async () => {
    const client = await connectClient();
    mockFetch.mockResolvedValueOnce(
      mockOk({ items: [{ id: 1, position: "Dev" }], total: 1, page: 1 }),
    );
    const res = await client.callTool({ name: "list_vacancies", arguments: { account_id: 1 } });
    expect(res.isError).toBeFalsy();
    // structuredContent присутствует и провалидирован сервером (иначе callTool бросил бы)
    const sc = res.structuredContent as { items: { position: string }[] };
    expect(sc.items[0].position).toBe("Dev");
  });

  it("ошибка API возвращается как isError, а не падает протокол", async () => {
    const client = await connectClient();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      text: async () => JSON.stringify({ errors: [{ type: "token_expired" }] }),
      headers: { get: () => null },
    });
    const res = await client.callTool({ name: "list_accounts", arguments: {} });
    expect(res.isError).toBe(true);
    const content = res.content as { type: string; text: string }[];
    expect(content[0].text).toMatch(/401/);
  });

  it("промпт skill-applicants ссылается на рабочие тулы", async () => {
    const client = await connectClient();
    const res = await client.getPrompt({
      name: "skill-applicants",
      arguments: { account_id: "1", vacancy_id: "2" },
    });
    const text = (res.messages[0].content as { text: string }).text;
    expect(text).toContain("list_vacancy_applicants");
    expect(text).toContain("list_stages");
    expect(text).not.toContain("search_applicants(account_id"); // старый сломанный вызов ушёл
  });
});
