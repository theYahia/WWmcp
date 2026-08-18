import { z } from "zod";
import { BoxberryClient } from "../client.js";
import type { BoxberryTracking } from "../types.js";

const client = new BoxberryClient();

export const trackSchema = z.object({
  tracking_number: z.string().describe("Трек-номер отправления Boxberry"),
});

export async function handleTrack(params: z.infer<typeof trackSchema>): Promise<string> {
  const result = (await client.call("ListStatuses", {
    ImId: params.tracking_number,
  })) as BoxberryTracking[];

  if (!Array.isArray(result) || result.length === 0) {
    return `Отправление ${params.tracking_number} не найдено или статусы отсутствуют.`;
  }

  const last = result[result.length - 1];
  return JSON.stringify({
    трек_номер: params.tracking_number,
    последний_статус: {
      дата: last.Date,
      статус: last.Name,
      комментарий: last.Comment,
    },
    все_статусы: result.map(s => ({
      дата: s.Date,
      статус: s.Name,
      комментарий: s.Comment,
    })),
  }, null, 2);
}
