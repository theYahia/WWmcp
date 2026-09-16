#!/usr/bin/env node

/**
 * @theyahia/jivosite-mcp — MCP server for the JivoSite API (Russia)
 *
 * 11 tools: get_chats, get_agents, get_contacts, create_contact, get_messages,
 * send_message, get_webhooks, create_webhook, delete_webhook,
 * skill_active_chats, skill_agent_stats.
 * Auth: JIVOSITE_TOKEN (Bearer). Optional: JIVOSITE_BASE_URL.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT; --port=N kept from 1.1.0)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";

import { getChatsSchema, handleGetChats } from "./tools/chats.js";
import { getAgentsSchema, handleGetAgents } from "./tools/agents.js";
import { getContactsSchema, handleGetContacts, createContactSchema, handleCreateContact } from "./tools/contacts.js";
import { getMessagesSchema, handleGetMessages, sendMessageSchema, handleSendMessage } from "./tools/messages.js";
import { getWebhooksSchema, handleGetWebhooks, createWebhookSchema, handleCreateWebhook, deleteWebhookSchema, handleDeleteWebhook } from "./tools/webhooks.js";
import { skillActiveChats } from "./skills/active-chats.js";
import { skillAgentStats } from "./skills/agent-stats.js";

const VERSION = "1.1.1";
const TOOL_COUNT = 11;

const logger = createLogger("jivosite-mcp");

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "jivosite-mcp",
    version: VERSION,
  });

  // --- Tools ---

  server.tool(
    "get_chats",
    "Получить список чатов JivoSite. Фильтр по статусу: active, closed, assigned.",
    getChatsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetChats(params) }] })),
  );

  server.tool(
    "get_agents",
    "Получить список агентов (операторов) JivoSite.",
    getAgentsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetAgents(params) }] })),
  );

  server.tool(
    "get_contacts",
    "Получить список контактов JivoSite. Поиск по имени, email, телефону.",
    getContactsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetContacts(params) }] })),
  );

  server.tool(
    "create_contact",
    "Создать новый контакт в JivoSite.",
    createContactSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateContact(params) }] })),
  );

  server.tool(
    "get_messages",
    "Получить сообщения из чата JivoSite по chat_id.",
    getMessagesSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetMessages(params) }] })),
  );

  server.tool(
    "send_message",
    "Отправить сообщение в чат JivoSite.",
    sendMessageSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleSendMessage(params) }] })),
  );

  server.tool(
    "get_webhooks",
    "Получить список вебхуков JivoSite.",
    getWebhooksSchema.shape,
    withErrorHandling(async () => ({ content: [{ type: "text", text: await handleGetWebhooks() }] })),
  );

  server.tool(
    "create_webhook",
    "Создать вебхук JivoSite для получения событий.",
    createWebhookSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleCreateWebhook(params) }] })),
  );

  server.tool(
    "delete_webhook",
    "Удалить вебхук JivoSite.",
    deleteWebhookSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleDeleteWebhook(params) }] })),
  );

  // --- Skills ---

  server.tool(
    "skill_active_chats",
    "Активные чаты сейчас — сводка по текущим активным чатам с операторами.",
    {},
    withErrorHandling(async () => ({ content: [{ type: "text", text: await skillActiveChats() }] })),
  );

  server.tool(
    "skill_agent_stats",
    "Статистика операторов — кто онлайн, кто оффлайн, общая сводка.",
    {},
    withErrorHandling(async () => ({ content: [{ type: "text", text: await skillAgentStats() }] })),
  );

  return server;
}

// ponytail: core reads the HTTP port from HTTP_PORT only; 1.1.0 documented
// `--http --port=3000`, so the flag is mapped onto the env var. Only together
// with --http: a set HTTP_PORT alone switches core to HTTP, 1.1.0 stayed on stdio.
const portArg = process.argv.find((a) => a.startsWith("--port="));
if (portArg && process.argv.includes("--http") && !process.env.HTTP_PORT) {
  process.env.HTTP_PORT = portArg.split("=")[1];
}

runServer(createMcpServer, {
  name: "jivosite-mcp",
  version: VERSION,
  toolCount: TOOL_COUNT,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
