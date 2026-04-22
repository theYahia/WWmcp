/**
 * Centralized error handling for MCP tool responses.
 *
 * Key insight from MCP spec: tool execution errors with `isError: true`
 * are injected back into the LLM context — the model can self-recover.
 * Protocol-level errors go to UI and are thrown. This distinction is critical.
 */

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";

export type ErrorCategory =
  | "validation"
  | "auth"
  | "rate_limit"
  | "not_found"
  | "server_error"
  | "timeout"
  | "unknown";

export interface ApiErrorInfo {
  status: number;
  message?: string;
  headers?: Record<string, string>;
  code?: string;
}

function isApiError(e: unknown): e is ApiErrorInfo {
  return typeof e === "object" && e !== null && "status" in e;
}

function isDOMAbortError(e: unknown): e is DOMException {
  return e instanceof DOMException && e.name === "AbortError";
}

function categorize(error: unknown): ErrorCategory {
  if (error instanceof ZodError) return "validation";
  if (isDOMAbortError(error)) return "timeout";
  if (!isApiError(error)) return "unknown";

  const { status } = error;
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status === 404) return "not_found";
  if (status >= 500) return "server_error";
  return "unknown";
}

/**
 * Converts any error into an MCP-compliant CallToolResult with `isError: true`
 * and a next-action suggestion so the LLM can self-recover.
 */
export function createToolError(error: unknown): CallToolResult {
  const category = categorize(error);

  switch (category) {
    case "validation": {
      const zodErr = error as ZodError;
      const details = zodErr.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join("; ");
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Ошибка валидации: ${details}. Исправьте параметры и повторите запрос.`,
          },
        ],
      };
    }

    case "auth":
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Ошибка авторизации. Токен истёк или неверен. Попросите пользователя проверить и перенастроить API-ключ.`,
          },
        ],
      };

    case "rate_limit": {
      const apiErr = error as ApiErrorInfo;
      const retryAfter = apiErr.headers?.["retry-after"] || "60";
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Rate limit. Повторите через ${retryAfter}с. Если это 3-й раз подряд — сообщите пользователю о превышении лимита API.`,
          },
        ],
      };
    }

    case "not_found":
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Ресурс не найден. Проверьте ID или параметры. Используйте search/list tool для поиска корректного идентификатора.`,
          },
        ],
      };

    case "server_error": {
      const apiErr = error as ApiErrorInfo;
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Ошибка сервера (HTTP ${apiErr.status}). Внешний API временно недоступен. Повторите запрос через 10-30 секунд.`,
          },
        ],
      };
    }

    case "timeout":
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Таймаут запроса. Внешний API не ответил вовремя. Повторите запрос. Если проблема повторяется — сообщите пользователю.`,
          },
        ],
      };

    default: {
      const msg =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Ошибка: ${msg}. Повторите запрос или попробуйте другой подход.`,
          },
        ],
      };
    }
  }
}

/**
 * Wraps a tool handler with automatic error handling.
 * Returns `isError: true` result instead of throwing.
 */
export function withErrorHandling<T = Record<string, unknown>>(
  handler: (params: T) => Promise<CallToolResult>,
): (params: T) => Promise<CallToolResult> {
  return async (params: T): Promise<CallToolResult> => {
    try {
      return await handler(params);
    } catch (error) {
      return createToolError(error);
    }
  };
}
