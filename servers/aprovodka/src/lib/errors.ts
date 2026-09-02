/**
 * 1C-specific error parsing.
 *
 * 1C:Enterprise OData REST API returns Russian-language error messages
 * inside HTTP error bodies. The platform wraps errors in either:
 *
 *   - Atom XML envelopes  (legacy default): <error><message xml:lang="ru">...</message></error>
 *   - JSON OData envelopes: { "odata.error": { "code": "...", "message": { "value": "..." } } }
 *
 * Both contain Russian text like "Объект не найден" or "Поле не заполнено".
 * For an LLM caller, surfacing the raw Russian is fine but it cannot self-recover
 * without a hint about what to try next.  This module maps the most common
 * error patterns to Russian-language recovery suggestions.
 *
 * NOTE: This is NOT a replacement for `@theyahia/mcp-core`'s `createToolError`
 * which categorises by HTTP status. This is an *additional* layer that runs
 * BEFORE the core handler, enriching the error body with a structured hint
 * the LLM can act on.
 */

import type { ApiError } from "@theyahia/mcp-core";

export interface OneCErrorParseResult {
  /** Russian error text as returned by 1C, if extracted. */
  raw_message?: string;
  /** Short English label of the error class. */
  category:
    | "object_not_found"
    | "field_required"
    | "type_mismatch"
    | "permission_denied"
    | "posting_failed"
    | "deletion_locked"
    | "invalid_guid"
    | "session_locked"
    | "validation_failed"
    | "unknown";
  /** Human-readable English summary. */
  summary: string;
  /** Подсказка о следующем шаге для модели или оператора. */
  suggestion: string;
}

/**
 * Patterns are matched in order; first match wins.
 * Each pattern is a (regex, mapping) pair — regex applied to the raw body
 * (which may contain XML, JSON, or plain text).
 */
const PATTERNS: Array<{
  re: RegExp;
  category: OneCErrorParseResult["category"];
  summary: string;
  suggestion: string;
}> = [
  {
    re: /Объект не найден|Object not found|по ссылке не найден/i,
    category: "object_not_found",
    summary: "Объект 1С не найден по ссылке Ref_Key",
    suggestion:
      "GUID в `Ref_Key` не соответствует ни одному объекту базы. " +
      "Проверить имя сущности через `list_entities`, затем найти действительный `Ref_Key` через `get_documents` или `get_catalogs`.",
  },
  {
    re: /Поле .*? не заполнено|Field .*? is required|Не заполнено значение/i,
    category: "field_required",
    summary: "Не заполнен обязательный реквизит объекта 1С",
    suggestion:
      "1С отклонила запись из-за пустого обязательного реквизита. " +
      "Имя реквизита указано в тексте ошибки — добавить его в `data`. " +
      "Состав полей смотреть через `list_entities` и разбор метаданных.",
  },
  {
    re: /несоответствие типов|Type mismatch|Несоответствие типа/i,
    category: "type_mismatch",
    summary: "Значение реквизита имеет неверный тип",
    suggestion:
      "Значение отправлено не того типа. Типовые случаи: даты — `datetime'ГГГГ-ММ-ДДTчч:мм:сс'`, " +
      "ссылки — объект `{Ref_Key, Type}`, булево — `true`/`false`, а не 0/1.",
  },
  {
    re: /Нарушение прав доступа|Permission denied|Недостаточно прав/i,
    category: "permission_denied",
    summary: "У пользователя 1С нет нужной роли или прав",
    suggestion:
      "У пользователя 1С нет права на этот объект или операцию. " +
      "Учётные данные при этом верны — нужна выдача роли администратором 1С.",
  },
  {
    re: /Документ не может быть проведен|Posting failed|Не удалось провести/i,
    category: "posting_failed",
    summary: "Проведение документа отклонено бизнес-логикой",
    suggestion:
      "Проведение отклонено бизнес-логикой конфигурации. Проверить, что контрагент, организация " +
      "и склад действительны и не помечены на удаление, а период не закрыт.",
  },
  {
    re: /пометка удаления|Cannot delete|удаление запрещено/i,
    category: "deletion_locked",
    summary: "Объект заблокирован или используется другими документами",
    suggestion:
      "1С отказывает в удалении: объект используется другими документами. " +
      "Вместо физического удаления выставить `DeletionMark: true` — инструмент `set_deletion_mark`.",
  },
  {
    re: /Неверный.*?GUID|Invalid GUID|guid'.*?'.*?invalid|неправильный формат идентификатора/i,
    category: "invalid_guid",
    summary: "Некорректный GUID в Ref_Key",
    suggestion:
      "`Ref_Key` должен быть 36-символьным UUID (например, `bd5a3c14-…`). Проверить значение аргумента `ref_key`.",
  },
  {
    // Голое `Блокировка` ловило и «Блокировка объекта другим пользователем» —
    // это блокировка записи, а не базы или сеанса, и summary про «базу или сеанс»
    // там прямая неправда. Теперь слово должно стоять рядом с базой или сеансом;
    // блокировка объекта уходит в `unknown` — модель получит исходный русский текст
    // и общую подсказку вместо уверенно неверной. `\S*`, а не `\w*`: в JS-регулярке
    // `\w` — только ASCII, окончание «Блокировка» им не покрывается.
    re: /сеанс.*?(заблокирован|locked)|database is locked|Блокировк\S*\s+(?:информационной\s+базы|базы|сеанса)/i,
    category: "session_locked",
    summary: "База или сеанс 1С временно заблокированы",
    suggestion:
      "Блокировку держит другой сеанс: регламентное задание, обновление конфигурации, восстановление. " +
      "Подождать 10–60 секунд и повторить; если не проходит — к администратору 1С.",
  },
  {
    re: /Ошибка валидации|Validation error|Bad Request|неверный запрос/i,
    category: "validation_failed",
    summary: "1С отклонила запрос на своей стороне",
    suggestion:
      "1С не приняла синтаксис OData-запроса. Обычные причины: незакрытая кавычка в `$filter`, " +
      "опечатка в имени реквизита, несовпадение регистра — в части конфигураций метаданные регистрозависимы.",
  },
];

/**
 * Extract the user-visible Russian message from a 1C error body
 * (XML or JSON OData envelope).
 */
function extractOneCMessage(body: string): string | undefined {
  if (!body) return undefined;
  // JSON OData envelope: { "odata.error": { "message": { "value": "..." } } }
  try {
    const parsed = JSON.parse(body) as {
      "odata.error"?: { message?: { value?: string } | string };
    };
    const env = parsed["odata.error"];
    if (env) {
      const msg = env.message;
      if (typeof msg === "string") return msg;
      if (msg && typeof msg === "object" && typeof msg.value === "string") {
        return msg.value;
      }
    }
  } catch {
    /* not JSON, fall through */
  }
  // XML Atom envelope: <message xml:lang="ru">...</message>
  const xmlMatch = body.match(/<message[^>]*>([\s\S]*?)<\/message>/i);
  if (xmlMatch && xmlMatch[1]) return xmlMatch[1].trim();
  // Plain text fallback — first 200 chars
  const trimmed = body.trim();
  if (trimmed.length > 0 && trimmed.length < 500) return trimmed;
  return undefined;
}

/**
 * Parse a 1C error body and return a structured hint.
 * Returns null if the body looks empty or non-1C.
 */
export function parseOneCError(body: string): OneCErrorParseResult | null {
  if (!body || body.length === 0) return null;

  const rawMessage = extractOneCMessage(body);
  const haystack = rawMessage ?? body;

  for (const p of PATTERNS) {
    if (p.re.test(haystack)) {
      return {
        raw_message: rawMessage,
        category: p.category,
        summary: p.summary,
        suggestion: p.suggestion,
      };
    }
  }

  // No pattern matched but we did get a message — return as unknown
  if (rawMessage) {
    return {
      raw_message: rawMessage,
      category: "unknown",
      summary: "Нераспознанная ошибка 1С",
      suggestion:
        "1С вернула ошибку, не попавшую ни под один известный шаблон. Прочитать исходный " +
        "русский текст и решить: повторить, изменить параметры или передать оператору.",
    };
  }

  return null;
}

/**
 * Format a parse result as a single-line string for inclusion in error responses.
 */
export function formatOneCErrorHint(parsed: OneCErrorParseResult): string {
  const head = `[1C ${parsed.category}] ${parsed.summary}`;
  const raw = parsed.raw_message ? ` — "${parsed.raw_message.slice(0, 200)}"` : "";
  return `${head}${raw}. Подсказка: ${parsed.suggestion}`;
}

/**
 * Helper: take an ApiError thrown by BaseHttpClient and enrich its message
 * with a 1C-specific hint when possible. Returns a new Error with the
 * enriched message and the original status preserved.
 *
 * If the error is not an ApiError, or has no body, returns the original error.
 */
export function enrichOneCError(error: unknown): unknown {
  if (!error || typeof error !== "object") return error;
  const err = error as ApiError & { body?: string };
  if (typeof err.status !== "number" || typeof err.body !== "string") {
    return error;
  }
  const parsed = parseOneCError(err.body);
  if (!parsed) return error;
  // Mutate message in place — preserves ApiError prototype + status field
  // that downstream `createToolError` uses for categorisation.
  err.message = `${err.message} | ${formatOneCErrorHint(parsed)}`;
  return error;
}
