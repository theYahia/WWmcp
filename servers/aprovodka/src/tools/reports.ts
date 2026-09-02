/**
 * get_report — единственный инструмент со свободным путём: всё остальное строит
 * путь само. Поэтому граница нужна именно здесь: без неё модель дотягивается под
 * учётной записью сервера до чего угодно на хосте 1С — `/e1cib/...`, служебных
 * точек публикации, чужих HTTP-сервисов. SSRF наружу закрыт в ядре (origin
 * сверяется с ONEC_BASE_URL), внутри хоста границу ставим здесь.
 */
import { z } from "zod";
import { oneCGet } from "../client.js";

/** Что разрешено дёргать: HTTP-сервисы конфигурации и штатная публикация OData. */
const ALLOWED_PREFIXES = ["/hs/", "/odata/standard.odata"] as const;

const REFUSAL =
  `Разрешены только относительные пути, начинающиеся с ${ALLOWED_PREFIXES.join(" или ")} — ` +
  "HTTP-сервисы конфигурации (/hs/) и штатная публикация OData. " +
  "Прочие адреса на сервере 1С (в том числе /e1cib/, служебные точки публикации и " +
  "чужие сервисы) через этот инструмент недоступны.";

/** ponytail: одна проверка на входе, без «санитайзинга» — сомнительный путь отклоняем, а не чиним. */
export function assertReportUrlAllowed(url: string): void {
  const fail = (why: string): never => {
    throw new Error(`report_url отклонён: ${why}. ${REFUSAL}`);
  };

  // Схема или protocol-relative — это уже другой хост, а не путь в базе.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) fail("это абсолютный URL со схемой");
  if (url.startsWith("//")) fail("это protocol-relative URL");
  if (!url.startsWith("/")) fail("путь должен начинаться с /");

  // Обход вверх — в том числе в процентной кодировке (%2e%2e).
  let decoded = url;
  try {
    decoded = decodeURIComponent(url);
  } catch {
    fail("некорректная процентная кодировка");
  }
  const segments = decoded.split(/[?#]/)[0]!.split("/");
  if (segments.includes("..")) fail("путь содержит переход вверх (..)");
  if (decoded.includes("\\")) fail("путь содержит обратный слэш");

  if (!ALLOWED_PREFIXES.some((p) => decoded.startsWith(p))) {
    fail(`префикс не входит в белый список (${decoded.split(/[?#]/)[0]})`);
  }
}

export const getReportSchema = z.object({
  report_url: z
    .string()
    .describe(
      "Относительный путь к HTTP-сервису конфигурации 1С (/hs/…) или к штатной публикации " +
      "OData (/odata/standard.odata/…), считая от ONEC_BASE_URL. Например: " +
      "/hs/reports/balance?date=2024-12-31. Инструмент нужен, чтобы получить данные " +
      "внешнего HTTP-сервиса конфигурации, а не произвольный URL: другие адреса на сервере " +
      "1С (/e1cib/, служебные точки публикации) отклоняются. Ответ возвращается как есть — " +
      "формат задаёт сам HTTP-сервис.",
    ),
});

export async function handleGetReport(params: z.infer<typeof getReportSchema>): Promise<string> {
  assertReportUrlAllowed(params.report_url);
  const result = await oneCGet(params.report_url);
  return JSON.stringify(result);
}
