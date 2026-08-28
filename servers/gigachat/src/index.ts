#!/usr/bin/env node

/**
 * @theyahia/gigachat-mcp — MCP server for Sber GigaChat API
 *
 * 8 tools: chat, list_models, embed_text, get_token_count,
 * generate_image, get_balance, list_assistants, file_upload.
 * Requires GIGACHAT_AUTH_KEY (Base64 client_id:client_secret).
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createLogger, runServer, withErrorHandling } from "@theyahia/mcp-core";
import { chatCompletionSchema, handleChatCompletion } from "./tools/chat.js";
import { handleListModels } from "./tools/models.js";
import { getEmbeddingsSchema, handleGetEmbeddings } from "./tools/embeddings.js";
import { getTokenCountSchema, handleGetTokenCount } from "./tools/token-count.js";
import { generateImageSchema, handleGenerateImage } from "./tools/generate-image.js";
import { handleGetBalance } from "./tools/balance.js";
import { handleListAssistants } from "./tools/assistants.js";
import { fileUploadSchema, handleFileUpload } from "./tools/file-upload.js";

const VERSION = "3.0.1";
const logger = createLogger("gigachat-mcp");

function createServer(): McpServer {
  const server = new McpServer({
    name: "gigachat-mcp",
    version: VERSION,
  });

  server.tool(
    "chat",
    "Генерация текста через GigaChat. Поддерживает диалог с системным промптом.",
    chatCompletionSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleChatCompletion(params) }],
    })),
  );

  server.tool(
    "list_models",
    "Список доступных моделей GigaChat.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleListModels() }],
    })),
  );

  server.tool(
    "embed_text",
    "Получение векторных представлений (эмбеддингов) текстов через GigaChat.",
    getEmbeddingsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetEmbeddings(params) }],
    })),
  );

  server.tool(
    "get_token_count",
    "Подсчёт токенов для массива текстов.",
    getTokenCountSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTokenCount(params) }],
    })),
  );

  server.tool(
    "generate_image",
    "Генерация изображения через GigaChat (описание в тексте сообщения).",
    generateImageSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGenerateImage(params) }],
    })),
  );

  server.tool(
    "get_balance",
    "Проверка остатка токенов/квоты GigaChat.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleGetBalance() }],
    })),
  );

  server.tool(
    "list_assistants",
    "Список доступных ассистентов GigaChat.",
    {},
    withErrorHandling(async () => ({
      content: [{ type: "text", text: await handleListAssistants() }],
    })),
  );

  server.tool(
    "file_upload",
    "Загрузка файла в GigaChat для мультимодальной обработки.",
    fileUploadSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleFileUpload(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "gigachat-mcp",
  version: VERSION,
  toolCount: 8,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
