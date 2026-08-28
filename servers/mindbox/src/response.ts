import type { MindboxOperationResponse } from "./types.js";

/**
 * Защитно привести произвольный JSON-ответ Mindbox к типу ответа операции.
 * Форма ответа настраивается per-operation в проекте, поэтому строгую zod-схему
 * не применяем (она отвергала бы валидные кастомные формы) — только guard на объект.
 */
export function toOperationResponse(data: unknown): MindboxOperationResponse {
  if (data && typeof data === "object") {
    return data as MindboxOperationResponse;
  }
  return {
    status: "ProtocolError",
    errorMessage: "Mindbox вернул неожиданный ответ (ожидался JSON-объект).",
  };
}

/**
 * Успех операции. TransactionAlreadyProcessed трактуем как успех:
 * по идемпотентности это значит, что запрос с тем же transactionId уже прошёл.
 */
export function isSuccess(r: MindboxOperationResponse): boolean {
  return r.status === "Success" || r.status === "TransactionAlreadyProcessed";
}

/**
 * Человекочитаемое описание ошибки: статус + errorMessage + validationMessages.
 * На ValidationError Mindbox возвращает validationMessages[{message, location}].
 */
export function describeFailure(r: MindboxOperationResponse): string {
  const parts: string[] = [`Статус: ${r.status}`];
  if (r.errorMessage) parts.push(r.errorMessage);
  if (r.validationMessages?.length) {
    parts.push(
      r.validationMessages
        .map((m) => (m.location ? `${m.location}: ${m.message}` : m.message))
        .filter(Boolean)
        .join("; "),
    );
  }
  return parts.join(". ");
}
