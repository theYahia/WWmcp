/**
 * Ошибки Voximplant API. Клиент наружу НЕ бросает — он собирает дружелюбное
 * сообщение через `parseVoxError` и возвращает его в `ApiResult.error`.
 * VoxError доступен для тестов и потенциальных throw-сценариев.
 */

export class VoxError extends Error {
  readonly status: number | null;
  readonly code: number | null;
  readonly details?: string;

  constructor(
    message: string,
    opts: { status?: number | null; code?: number | null; details?: string } = {},
  ) {
    super(message);
    this.name = "VoxError";
    this.status = opts.status ?? null;
    this.code = opts.code ?? null;
    this.details = opts.details;
  }
}

/** Подсказка по HTTP-статусу — что обычно значит и куда копать. */
export function statusHint(status: number): string {
  switch (status) {
    case 400: return "неверный запрос (проверьте параметры)";
    case 401: return "не авторизован (проверьте VOXIMPLANT_API_KEY)";
    case 403: return "доступ запрещён (ключ без прав или аккаунт заблокирован)";
    case 404: return "метод или ресурс не найден";
    case 405: return "метод не разрешён";
    case 413: return "слишком большой запрос";
    case 429: return "превышен лимит запросов (rate limit)";
    case 500:
    case 502:
    case 503:
    case 504: return "ошибка на стороне Voximplant";
    default: return `HTTP ${status}`;
  }
}

/**
 * Защитный разбор тела ошибки Voximplant в `VoxError`. Поддерживает формы:
 *  - `{ error: { code, msg } }`                  — основная форма Platform API
 *  - `{ error: "...", error_description: "..." }` — OAuth-подобная
 *  - произвольный blob                           — усечённый дамп (≤600 симв.) + подсказка
 */
export function parseVoxError(body: unknown, status?: number): VoxError {
  const hint = status ? statusHint(status) : null;

  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    const err = b.error;

    // { error: { code, msg } }
    if (err && typeof err === "object") {
      const e = err as { code?: number; msg?: string; message?: string };
      const msg = e.msg ?? e.message ?? "неизвестная ошибка";
      return new VoxError(
        `Voximplant${e.code != null ? ` [${e.code}]` : ""}: ${msg}`,
        { status: status ?? null, code: e.code ?? null },
      );
    }

    // { error: "string", error_description?: "..." }
    if (typeof err === "string") {
      const desc = typeof b.error_description === "string" ? `: ${b.error_description}` : "";
      return new VoxError(`Voximplant: ${err}${desc}`, { status: status ?? null });
    }
  }

  // Непонятная форма — усечённый дамп + подсказка по статусу.
  const blob = typeof body === "string" ? body : safeStringify(body);
  const trimmed = blob.length > 600 ? `${blob.slice(0, 600)}…` : blob;
  const prefix = hint ? `Voximplant (${hint})` : "Voximplant: неизвестная ошибка";
  return new VoxError(trimmed ? `${prefix}: ${trimmed}` : prefix, {
    status: status ?? null,
    details: trimmed || undefined,
  });
}

function safeStringify(v: unknown): string {
  try { return JSON.stringify(v); } catch { return String(v); }
}
