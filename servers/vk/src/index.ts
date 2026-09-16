#!/usr/bin/env node

/**
 * @theyahia/vk-mcp — MCP server for the VK (VKontakte) API
 *
 * 8 tools: get_wall, post_wall, search_posts, get_user, get_groups,
 * get_friends, send_message, get_stats. 2 prompts: post-wall, group-stats.
 * Auth: VK_ACCESS_TOKEN.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { z } from "zod";

import { getWallSchema, handleGetWall, postWallSchema, handlePostWall, searchPostsSchema, handleSearchPosts } from "./tools/wall.js";
import { getUserSchema, handleGetUser, getGroupsSchema, handleGetGroups } from "./tools/users.js";
import { getFriendsSchema, handleGetFriends } from "./tools/friends.js";
import { sendMessageSchema, handleSendMessage } from "./tools/messages.js";
import { getStatsSchema, handleGetStats } from "./tools/stats.js";

const VERSION = "1.1.1";
const logger = createLogger("vk-mcp");

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "vk-mcp",
    version: VERSION,
  });

  // ── Tools (8) ──────────────────────────────────────────────

  server.tool(
    "get_wall",
    "Получить записи со стены пользователя или сообщества ВКонтакте.",
    getWallSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetWall(params) }] })),
  );

  server.tool(
    "post_wall",
    "Опубликовать запись на стене пользователя или сообщества ВКонтакте.",
    postWallSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handlePostWall(params) }] })),
  );

  server.tool(
    "search_posts",
    "Поиск постов в новостной ленте ВКонтакте по ключевым словам.",
    searchPostsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleSearchPosts(params) }] })),
  );

  server.tool(
    "get_user",
    "Информация о пользователях ВКонтакте по ID или screen_name.",
    getUserSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetUser(params) }] })),
  );

  server.tool(
    "get_groups",
    "Информация о сообществах ВКонтакте по ID или короткому имени.",
    getGroupsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetGroups(params) }] })),
  );

  server.tool(
    "get_friends",
    "Список друзей пользователя ВКонтакте.",
    getFriendsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetFriends(params) }] })),
  );

  server.tool(
    "send_message",
    "Отправить сообщение пользователю или в беседу ВКонтакте.",
    sendMessageSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleSendMessage(params) }] })),
  );

  server.tool(
    "get_stats",
    "Статистика сообщества ВКонтакте за указанный период.",
    getStatsSchema.shape,
    withErrorHandling(async (params) => ({ content: [{ type: "text", text: await handleGetStats(params) }] })),
  );

  // ── Prompts / Skills (2) ───────────────────────────────────

  server.prompt(
    "post-wall",
    "Опубликуй пост в группу VK",
    {
      group_id: z.string().describe("ID группы (без минуса)"),
      text: z.string().describe("Текст поста"),
    },
    async ({ group_id, text }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Опубликуй пост в группу VK (owner_id: -${group_id}) со следующим текстом:\n\n${text}\n\nИспользуй инструмент post_wall. Параметр from_group=1, чтобы пост был от имени группы.`,
          },
        },
      ],
    }),
  );

  server.prompt(
    "group-stats",
    "Статистика группы VK",
    {
      group_id: z.string().describe("ID группы"),
      days: z.string().optional().describe("За сколько дней (по умолчанию 7)"),
    },
    async ({ group_id, days }) => {
      const d = Number(days) || 7;
      const to = new Date();
      const from = new Date(to.getTime() - d * 86400000);
      const fmt = (dt: Date) => dt.toISOString().slice(0, 10);
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Покажи статистику группы VK (group_id: ${group_id}) за период ${fmt(from)} — ${fmt(to)}.\n\nИспользуй инструмент get_stats. Представь данные в виде таблицы: дата, просмотры, посетители, подписки.`,
            },
          },
        ],
      };
    },
  );

  return server;
}

export { createMcpServer };

// README обещает `--http` с портом из PORT, а ядро читает HTTP_PORT. Только при --http:
// сам по себе PORT (его ставят многие хостинги) не должен переключать stdio на HTTP.
if (process.argv.includes("--http") && process.env["PORT"] && !process.env["HTTP_PORT"]) {
  process.env["HTTP_PORT"] = process.env["PORT"];
}

runServer(createMcpServer, {
  name: "vk-mcp",
  version: VERSION,
  toolCount: 8,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
