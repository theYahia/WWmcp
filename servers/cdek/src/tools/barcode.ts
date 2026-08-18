import { z } from "zod";
import { getClient } from "../client.js";
import type { CdekOrder } from "../types.js";

export const generateBarcodeSchema = z.object({
  uuid: z.string().describe("UUID заказа СДЭК для генерации штрихкода"),
  copy_count: z.number().int().min(1).max(10).default(1).describe("Количество копий (1-10, по умолчанию 1)"),
  format: z.enum(["A4", "A5", "A6"]).default("A4").describe("Формат печати (A4, A5, A6)"),
});

export async function handleGenerateBarcode(params: z.infer<typeof generateBarcodeSchema>): Promise<string> {
  const body = {
    copy_count: params.copy_count,
    format: params.format,
  };

  const result = (await getClient().post(`/orders/${params.uuid}/barcode`, body)) as CdekOrder;

  if (result.errors && result.errors.length > 0) {
    const msgs = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
    return `Ошибка генерации штрихкода: ${msgs}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Запрос на генерацию штрихкода принят. Используйте get_order для получения ссылки.",
  }, null, 2);
}
