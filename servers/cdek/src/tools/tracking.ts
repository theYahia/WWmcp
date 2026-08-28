import { z } from "zod";
import { getClient } from "../client.js";
import type { CdekOrder } from "../types.js";

export const trackShipmentSchema = z.object({
  cdek_number: z.string().describe("Номер отправления СДЭК (например 1234567890)"),
});

export async function handleTrackShipment(params: z.infer<typeof trackShipmentSchema>): Promise<string> {
  const result = (await getClient().get("/orders", { cdek_number: params.cdek_number })) as CdekOrder;

  if (result.errors && result.errors.length > 0) {
    const msgs = result.errors.map(e => `[${e.code}] ${e.message}`).join("; ");
    return `Ошибка отслеживания: ${msgs}`;
  }

  const entity = result.entity;
  if (!entity) {
    return `Отправление ${params.cdek_number} не найдено.`;
  }

  const statuses = entity.statuses ?? [];
  const lastStatus = statuses[0];

  return JSON.stringify({
    номер: entity.cdek_number,
    uuid: entity.uuid,
    последний_статус: lastStatus ? {
      код: lastStatus.code,
      название: lastStatus.name,
      дата: lastStatus.date_time,
      город: lastStatus.city,
    } : null,
    все_статусы: statuses.map(s => ({
      код: s.code,
      название: s.name,
      дата: s.date_time,
      город: s.city,
    })),
  }, null, 2);
}
