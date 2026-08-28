#!/usr/bin/env node

/**
 * @theyahia/salutespeech-mcp — MCP server for Sber SaluteSpeech API
 *
 * 5 tools: recognize_speech, synthesize_speech, list_models,
 * get_task_status, recognize_file.
 * Auth: SALUTESPEECH_API_KEY (Base64 client_id:client_secret) — see src/client.ts.
 *
 * Transports: stdio (default), Streamable HTTP (--http or HTTP_PORT)
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  createLogger,
  createToolError,
  runServer,
  withErrorHandling,
} from "@theyahia/mcp-core";
import { recognizeSpeechSchema, handleRecognizeSpeech } from "./tools/recognize.js";
import { synthesizeSpeechSchema, handleSynthesizeSpeech } from "./tools/synthesize.js";
import { listModelsSchema, handleListModels } from "./tools/list-models.js";
import { getTaskStatusSchema, handleGetTaskStatus } from "./tools/get-task-status.js";
import { recognizeFileSchema, handleRecognizeFile } from "./tools/recognize-file.js";

const VERSION = "1.2.0";

const logger = createLogger("salutespeech-mcp");

// ponytail: synthesize_speech returns a base64 audio blob. core's withErrorHandling
// truncates text blocks at 50k chars, which would silently corrupt that payload —
// so this one path reuses core's error taxonomy but skips sanitize/truncate.
function rawTool<T>(handler: (params: T) => Promise<string>) {
  return async (params: T): Promise<CallToolResult> => {
    try {
      return { content: [{ type: "text", text: await handler(params) }] };
    } catch (error) {
      return createToolError(error);
    }
  };
}

function createServer(): McpServer {
  const server = new McpServer({
    name: "salutespeech-mcp",
    version: VERSION,
  });

  server.tool(
    "recognize_speech",
    "Speech recognition via SaluteSpeech. Accepts Base64 audio, returns text transcription.",
    recognizeSpeechSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRecognizeSpeech(params) }],
    })),
  );

  server.tool(
    "synthesize_speech",
    "Text-to-speech via SaluteSpeech. Accepts text, returns Base64-encoded audio.",
    synthesizeSpeechSchema.shape,
    rawTool(handleSynthesizeSpeech),
  );

  server.tool(
    "list_models",
    "List available SaluteSpeech models and voices for recognition and synthesis.",
    listModelsSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleListModels(params) }],
    })),
  );

  server.tool(
    "get_task_status",
    "Check status of an async SaluteSpeech recognition task by ID.",
    getTaskStatusSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleGetTaskStatus(params) }],
    })),
  );

  server.tool(
    "recognize_file",
    "Recognize speech from a local audio file. Auto-detects format from extension.",
    recognizeFileSchema.shape,
    withErrorHandling(async (params) => ({
      content: [{ type: "text", text: await handleRecognizeFile(params) }],
    })),
  );

  return server;
}

runServer(createServer, {
  name: "salutespeech-mcp",
  version: VERSION,
  toolCount: 5,
  logger,
}).catch((error) => {
  logger.error("Fatal error", {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
