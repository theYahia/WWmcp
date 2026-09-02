/**
 * Промпты и бутстрап — публичный интерфейс пакета, до сих пор не покрытый ничем.
 *
 * Промпты — первое, что пользователь видит в Claude Desktop, и они отгружаются в
 * npm. Опечатка в имени инструмента внутри текста промпта сборку не ломает — она
 * молча ломает сценарий у пользователя. Здесь проверяется только ссылочная
 * целостность (имена существуют), смысл текстов не проверяется.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { startHttp } from "@theyahia/mcp-core";
import {
  createServer,
  countRegisteredTools,
  getEnabledModules,
  VERSION,
} from "../src/server.js";

/** Аргументы-заглушки для промптов с обязательными параметрами. */
const PROMPT_ARGS: Record<string, Record<string, string>> = {
  "inventory-database": {},
  "find-and-post-document": { query: "ТД-00123" },
  "reconcile-balances": { register_name: "ОстаткиТоваровНаСкладах" },
};

async function withClient<T>(fn: (client: Client) => Promise<T>): Promise<T> {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  try {
    return await fn(client);
  } finally {
    await client.close();
  }
}

/** Текст всех сообщений промпта одной строкой. */
function textOf(result: { messages: Array<{ content: unknown }> }): string {
  return result.messages
    .map((m) => {
      const c = m.content as { type?: string; text?: string };
      return c?.type === "text" ? (c.text ?? "") : "";
    })
    .join("\n");
}

/**
 * Имена инструментов, упомянутые в тексте: токены в обратных кавычках вида
 * `get_documents`. Форма нарочно узкая — со строчной буквы и хотя бы одно
 * подчёркивание, поэтому `Ref_Key` и прочие имена полей 1С сюда не попадают.
 */
function mentionedTools(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(/`([a-z][a-z0-9]*(?:_[a-z0-9]+)+)`/g)) {
    found.add(m[1]!);
  }
  return [...found];
}

describe("промпты", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env["ONEC_SERVICES"];
    delete process.env["ONEC_WRITE_MODE"];
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("регистрируются все три и отдают непустой текст", async () => {
    await withClient(async (client) => {
      const { prompts } = await client.listPrompts();
      expect(prompts.map((p) => p.name).sort()).toEqual(
        ["find-and-post-document", "inventory-database", "reconcile-balances"],
      );

      for (const p of prompts) {
        const result = await client.getPrompt({
          name: p.name,
          arguments: PROMPT_ARGS[p.name] ?? {},
        });
        expect(result.messages.length).toBeGreaterThan(0);
        expect(textOf(result).trim().length).toBeGreaterThan(50);
      }
    });
  });

  it("каждое имя инструмента из текста промпта существует в реестре", async () => {
    await withClient(async (client) => {
      const { tools } = await client.listTools();
      const registered = new Set(tools.map((t) => t.name));

      const { prompts } = await client.listPrompts();
      const unknown: Array<{ prompt: string; tool: string }> = [];
      let checked = 0;

      for (const p of prompts) {
        const result = await client.getPrompt({
          name: p.name,
          arguments: PROMPT_ARGS[p.name] ?? {},
        });
        for (const tool of mentionedTools(textOf(result))) {
          checked++;
          if (!registered.has(tool)) unknown.push({ prompt: p.name, tool });
        }
      }

      expect(unknown).toEqual([]);
      // Страховка от «проверили ноль имён и обрадовались»: если регулярка
      // перестанет находить имена, тест обязан упасть, а не позеленеть.
      expect(checked).toBeGreaterThanOrEqual(10);
    });
  });

  it("переименование инструмента ломает проверку (регулярка правда находит имена)", async () => {
    await withClient(async (client) => {
      const { prompts } = await client.listPrompts();
      const result = await client.getPrompt({
        name: "inventory-database",
        arguments: {},
      });
      expect(prompts.length).toBe(3);
      const mentioned = mentionedTools(textOf(result));
      expect(mentioned).toContain("list_entities");
      expect(mentioned).toContain("describe_entity");
      // Имя после переименования в реестре не нашлось бы — именно это и ловит тест выше.
      const registered = new Set((await client.listTools()).tools.map((t) => t.name));
      expect(registered.has("list_entities_renamed")).toBe(false);
    });
  });
});

describe("бутстрап HTTP-транспорта", () => {
  it("/health отвечает 200, отдаёт версию пакета и число инструментов", async () => {
    const toolCount = countRegisteredTools(getEnabledModules());
    // Порт 0 — свободный назначает ОС; фиксированный номер флейчит на занятой машине.
    const httpServer = (await startHttp(createServer, {
      name: "aprovodka",
      version: VERSION,
      toolCount,
      port: 0,
    })) as { close(cb?: () => void): void; address(): { port: number } | string | null };

    try {
      const addr = httpServer.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      expect(port).toBeGreaterThan(0);

      const res = await fetch(`http://127.0.0.1:${port}/health`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as Record<string, unknown>;
      expect(body["status"]).toBe("ok");
      expect(body["server"]).toBe("aprovodka");
      expect(body["version"]).toBe(VERSION);
      expect(body["tools"]).toBe(toolCount);
      // Версия — из package.json, а не из литерала в коде (WORK-1510).
      expect(String(body["version"])).toMatch(/^\d+\.\d+\.\d+/);
    } finally {
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    }
  });
});
