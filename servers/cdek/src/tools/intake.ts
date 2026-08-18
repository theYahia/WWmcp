import { z } from "zod";
import { getClient } from "../client.js";

export const createIntakeSchema = z.object({
  order_uuid: z.string().describe("UUID заказа для вызова курьера"),
  intake_date: z.string().describe("Дата забора (YYYY-MM-DD)"),
  intake_time_from: z.string().describe("Время забора с (HH:MM)"),
  intake_time_to: z.string().describe("Время забора до (HH:MM)"),
  name: z.string().optional().describe("ФИО отправителя"),
  phone: z.string().optional().describe("Телефон отправителя"),
  comment: z.string().optional().describe("Комментарий для курьера"),
});

export const getIntakeSchema = z.object({
  uuid: z.string().describe("UUID заявки на вызов курьера"),
});

export async function handleCreateIntake(
  params: z.infer<typeof createIntakeSchema>
): Promise<string> {
  const body: Record<string, unknown> = {
    order_uuid: params.order_uuid,
    intake_date: params.intake_date,
    intake_time_from: params.intake_time_from,
    intake_time_to: params.intake_time_to,
  };
  if (params.name) body.name = params.name;
  if (params.phone) body.phone = params.phone;
  if (params.comment) body.comment = params.comment;

  const result = (await getClient().post("/intakes", body)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: {
      uuid: string;
      order_uuid: string;
      intake_date: string;
      intake_time_from: string;
      intake_time_to: string;
    };
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка создания заявки на курьера: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    order_uuid: result.entity?.order_uuid,
    дата_забора: result.entity?.intake_date,
    время_с: result.entity?.intake_time_from,
    время_до: result.entity?.intake_time_to,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Заявка на вызов курьера создана.",
  }, null, 2);
}

export async function handleGetIntake(
  params: z.infer<typeof getIntakeSchema>
): Promise<string> {
  const result = (await getClient().get(`/intakes/${params.uuid}`)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: {
      uuid: string;
      order_uuid: string;
      cdek_number?: string;
      intake_date: string;
      intake_time_from: string;
      intake_time_to: string;
      statuses?: Array<{ code: string; name: string; date_time: string }>;
    };
  };

  if (result.errors?.length) {
    return `Ошибка: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  const entity = result.entity;
  return JSON.stringify({
    uuid: entity?.uuid,
    order_uuid: entity?.order_uuid,
    номер_сдэк: entity?.cdek_number,
    дата_забора: entity?.intake_date,
    время_с: entity?.intake_time_from,
    время_до: entity?.intake_time_to,
    статусы: entity?.statuses?.map(s => ({ код: s.code, название: s.name, дата: s.date_time })),
  }, null, 2);
}
