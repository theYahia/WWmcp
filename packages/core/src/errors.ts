/**
 * Centralized error handling for MCP tool responses.
 *
 * Key insight from MCP spec: tool execution errors with `isError: true`
 * are injected back into the LLM context — the model can self-recover.
 * Protocol-level errors go to UI and are thrown. This distinction is critical.
 */

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";
import { sanitizeApiResponse, truncateResponse } from "./sanitize.js";

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
 * Достать текст ошибки: `Error.message` либо поле `message` у ApiError-подобного
 * объекта. Пустая строка — «сообщения нет».
 */
function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.trim();
  if (isApiError(error) && typeof error.message === "string") {
    return error.message.trim();
  }
  return "";
}

/**
 * Дописать к канонной фразе ветки исходное сообщение ошибки.
 *
 * Ветки `auth` / `rate_limit` / `not_found` / `server_error` классифицируют по
 * HTTP-статусу и раньше возвращали ТОЛЬКО свою фиксированную фразу — всё, что
 * сервер положил в `message`, пропадало по дороге к модели. Для серверов, которые
 * разбирают тело ошибки внешнего API (aprovodka с русскими ошибками 1С), это
 * выбрасывало разбор целиком: `object_not_found`, `permission_denied` и
 * `session_locked` приходят ровно на 404 и 403, то есть на ветках, игнорировавших
 * сообщение. Модель получала консервную фразу вместо «проверьте имя сущности».
 *
 * ponytail: конкатенация, а не отдельное поле в результате — MCP отдаёт модели
 * текстовый блок, и второй блок она читает так же, как хвост первого.
 */
function withDetails(canonical: string, error: unknown): string {
  const msg = errorMessage(error);
  if (!msg || canonical.includes(msg)) return canonical;
  return `${canonical} Детали: ${msg}`;
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
      const details = zodErr.issues
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

    case "auth": {
      const apiErr = error as ApiErrorInfo;
      // Формулировка нейтральна намеренно: ядро общее для всех серверов монорепы,
      // и способ аутентификации у них разный. Прежний текст звал «перенастроить
      // API-ключ» — для 1С это вредный совет: там HTTP Basic логином и паролем,
      // а 403 чаще всего означает не сломанные учётные данные, а недостающую роль.
      const canonical =
        `Отказ в доступе (HTTP ${apiErr.status}). Учётные данные не приняты либо ` +
        "у пользователя нет прав на эту операцию. Попросите пользователя проверить " +
        "настройки доступа сервера (ключ, токен или логин с паролем — смотря что " +
        "требует API) и права его учётной записи.";
      return {
        isError: true,
        content: [{ type: "text", text: withDetails(canonical, error) }],
      };
    }

    case "rate_limit": {
      const apiErr = error as ApiErrorInfo;
      const retryAfter = apiErr.headers?.["retry-after"] || "60";
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: withDetails(
              `Rate limit. Повторите через ${retryAfter}с. Если это 3-й раз подряд — сообщите пользователю о превышении лимита API.`,
              error,
            ),
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
            text: withDetails(
              `Ресурс не найден. Проверьте ID или параметры. Используйте search/list tool для поиска корректного идентификатора.`,
              error,
            ),
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
            text: withDetails(
              `Ошибка сервера (HTTP ${apiErr.status}). Внешний API временно недоступен. Повторите запрос через 10-30 секунд.`,
              error,
            ),
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
 * Applies output sanitization (prompt-injection stripping) + truncation to the
 * text content blocks of a successful tool result. Runs for ALL servers via
 * `withErrorHandling`, so external API data never reaches the LLM unfiltered.
 *
 * Escape hatch: set `MCP_DISABLE_SANITIZE=true` for trusted public-data servers
 * (e.g. cbr/cbu central-bank rates) where `[filtered]` substitution could corrupt
 * legitimate output. Read at call time so tests can toggle it per-case.
 */
function sanitizeResult(result: CallToolResult): CallToolResult {
  if (process.env["MCP_DISABLE_SANITIZE"] === "true" || !result.content) {
    return result;
  }
  for (const block of result.content) {
    if (block.type === "text" && typeof block.text === "string") {
      block.text = truncateResponse(sanitizeApiResponse(block.text));
    }
  }
  return result;
}

/**
 * Wraps a tool handler with automatic error handling + output sanitization.
 * Returns `isError: true` result instead of throwing; successful results pass
 * through `sanitizeResult` (prompt-injection guard + truncation).
 */
export function withErrorHandling<T = Record<string, unknown>>(
  handler: (params: T) => Promise<CallToolResult>,
): (params: T) => Promise<CallToolResult> {
  return async (params: T): Promise<CallToolResult> => {
    try {
      return sanitizeResult(await handler(params));
    } catch (error) {
      return createToolError(error);
    }
  };
}
