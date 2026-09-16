/**
 * Разбор ошибок VK Ads API.
 *
 * Формат ошибок у API НЕ единый (подтверждено оф. документацией target.vk.ru):
 *   A) auth-ошибки:        { "code": "invalid_token", "message": "Unknown access token" }
 *   B) OAuth2/валидация:   { "error": "empty_request_body", "error_description": "..." }
 *   C) field-валидация:    400 с массивом/объектом ошибок по полям (формат не опубликован)
 * Поэтому парсим защитно по всем трём формам и не предполагаем вложенный {error:{code,message}}.
 *
 * Результат — `ApiError` из @theyahia/mcp-core: `withErrorHandling` классифицирует его по
 * HTTP-статусу и дописывает наше сообщение к канонной фразе ветки, поэтому модель видит и
 * категорию, и настоящую причину от VK.
 */

import { ApiError } from "@theyahia/mcp-core";

/** Короткая подсказка по HTTP-статусу (набор кодов из оф. API overview). */
function statusHint(status: number): string {
  switch (status) {
    case 400: return "некорректные данные запроса";
    case 401: return "невалидный или отсутствующий токен";
    case 403: return "операция не разрешена для этого кабинета";
    case 404: return "ресурс не найден";
    case 405: return "метод не поддерживается";
    case 413: return "тело запроса слишком большое";
    case 429: return "превышен лимит запросов (throttling)";
    case 500: return "внутренняя ошибка API";
    default:  return "ошибка API";
  }
}

/** Компактно сворачивает неизвестную форму C (массив/объект полевых ошибок) в строку. */
function summarizeUnknown(parsed: unknown): string {
  try {
    const json = JSON.stringify(parsed);
    return json.length > 600 ? json.slice(0, 600) + "…" : json;
  } catch {
    return "";
  }
}

/** Достаёт из тела ответа VK Ads пару {code, message} по любой из трёх известных форм. */
export function parseVkError(status: number, body: string | undefined): ApiError {
  let parsed: unknown;
  try {
    parsed = body ? JSON.parse(body) : undefined;
  } catch {
    parsed = undefined;
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;

    // Форма B: { error, error_description }
    if (typeof obj.error === "string") {
      const message = typeof obj.error_description === "string" ? obj.error_description : statusHint(status);
      return new ApiError(status, `VK Ads [${obj.error}]: ${message}`, body, undefined, obj.error);
    }

    // Форма A: { code, message }
    if (typeof obj.code === "string" || typeof obj.message === "string") {
      const code = typeof obj.code === "string" ? obj.code : String(status);
      const message = typeof obj.message === "string" ? obj.message : statusHint(status);
      return new ApiError(status, `VK Ads [${code}]: ${message}`, body, undefined, code);
    }

    // Форма C: полевые ошибки / неизвестная структура
    const summary = summarizeUnknown(parsed);
    return new ApiError(status, `VK Ads: ${summary || statusHint(status)}`, body, undefined, String(status));
  }

  // Не-JSON тело
  const trimmed = (body ?? "").trim();
  const message = trimmed ? `${statusHint(status)}: ${trimmed.slice(0, 500)}` : statusHint(status);
  return new ApiError(status, `VK Ads: ${message}`, body, undefined, String(status));
}
