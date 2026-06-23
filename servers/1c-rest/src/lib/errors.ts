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
 * error patterns to English-language recovery suggestions.
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
  /** Actionable next-step suggestion for the LLM/operator. */
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
    summary: "1C object not found by reference / Ref_Key",
    suggestion:
      "The Ref_Key (GUID) does not match any object in the database. " +
      "Call `list_entities` to verify the entity name, then `get_documents` or `get_catalogs` to find a valid Ref_Key.",
  },
  {
    re: /Поле .*? не заполнено|Field .*? is required|Не заполнено значение/i,
    category: "field_required",
    summary: "Required field missing in 1C object",
    suggestion:
      "1C rejected the payload because a mandatory field was empty. " +
      "Inspect the error text for the field name and add it to `data`. " +
      "Use `list_entities` + metadata exploration to discover required fields.",
  },
  {
    re: /несоответствие типов|Type mismatch|Несоответствие типа/i,
    category: "type_mismatch",
    summary: "Field value has wrong type",
    suggestion:
      "A field was sent with the wrong type. Common cases: dates must be `datetime'YYYY-MM-DDTHH:mm:ss'`, " +
      "Ref values must be objects `{Ref_Key, Type}`, booleans must be true/false (not 0/1).",
  },
  {
    re: /Нарушение прав доступа|Permission denied|Недостаточно прав/i,
    category: "permission_denied",
    summary: "1C user lacks required role/permissions",
    suggestion:
      "The 1C user has no permission for this entity/operation. " +
      "Ask the 1C administrator to grant the required role; the API key/user itself is valid.",
  },
  {
    re: /Документ не может быть проведен|Posting failed|Не удалось провести/i,
    category: "posting_failed",
    summary: "Document posting failed (business logic rejection)",
    suggestion:
      "1C posting rules rejected the document. Check that referenced entities (counterparty, organization, " +
      "warehouse) are valid and active, and that posting period is open.",
  },
  {
    re: /пометка удаления|Cannot delete|удаление запрещено/i,
    category: "deletion_locked",
    summary: "Object is locked or referenced elsewhere",
    suggestion:
      "1C refuses deletion because the object is referenced by other documents. " +
      "Set `DeletionMark: true` via `update_document` instead of hard-delete.",
  },
  {
    re: /Неверный.*?GUID|Invalid GUID|guid'.*?'.*?invalid|неправильный формат идентификатора/i,
    category: "invalid_guid",
    summary: "Malformed GUID/Ref_Key",
    suggestion:
      "Ref_Key must be a 36-character UUID (e.g. `bd5a3c14-...`). Check the value passed to `ref_key`.",
  },
  {
    re: /сеанс.*?(заблокирован|locked)|database is locked|Блокировка/i,
    category: "session_locked",
    summary: "1C database/session is temporarily locked",
    suggestion:
      "Another 1C session holds a lock (e.g. background scheduled job, restore, configuration update). " +
      "Wait 10-60 seconds and retry. If persists — contact 1C administrator.",
  },
  {
    re: /Ошибка валидации|Validation error|Bad Request|неверный запрос/i,
    category: "validation_failed",
    summary: "Request validation failed at 1C side",
    suggestion:
      "1C rejected the OData query syntax. Common issues: unbalanced quotes in $filter, " +
      "wrong field name, mixed case (1C metadata is case-sensitive in some configs).",
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
      summary: "Unrecognised 1C error",
      suggestion:
        "1C returned an error not in the known pattern set. Read the raw Russian message and " +
        "decide whether to retry, change parameters, or escalate to a human operator.",
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
  return `${head}${raw}. Suggestion: ${parsed.suggestion}`;
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
