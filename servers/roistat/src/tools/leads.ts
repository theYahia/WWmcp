import { z } from "zod";
import { getClient } from "../client.js";

export const getLeadsSchema = z.object({
  from: z.string().describe("Дата начала периода (YYYY-MM-DD)"),
  to: z.string().describe("Дата конца периода (YYYY-MM-DD)"),
  limit: z.number().default(50).describe("Максимум лидов в ответе"),
  offset: z.number().default(0).describe("Смещение для пагинации"),
  statuses: z.array(z.string()).optional().describe("Фильтр по статусам заявок"),
});

export async function handleGetLeads(params: z.infer<typeof getLeadsSchema>): Promise<string> {
  const body: Record<string, unknown> = {
    filters: {
      and: [
        ["date", ">", params.from],
        ["date", "<", params.to],
      ],
    },
    limit: params.limit,
    offset: params.offset,
  };
  if (params.statuses?.length) {
    (body.filters as Record<string, unknown[]>).and.push(["roistat_status", "in", params.statuses]);
  }

  const result = (await getClient().post("/project/leads", body)) as {
    data: Record<string, unknown>[];
    total: number;
    status: string;
  };

  if (!result.data || result.data.length === 0) {
    return "Лиды за указанный период не найдены.";
  }

  return JSON.stringify({
    период: { от: params.from, до: params.to },
    всего: result.total,
    лиды: result.data,
  }, null, 2);
}
