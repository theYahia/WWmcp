import { z } from "zod";
import { getClient } from "../client.js";

export const createWebhookSchema = z.object({
  url: z.string().url()
    .describe("URL для получения уведомлений (HTTPS)"),
  type: z.enum(["ORDER_STATUS", "DOWNLOAD_PHOTO"])
    .describe("Тип вебхука: ORDER_STATUS (статусы заказов) или DOWNLOAD_PHOTO"),
});

export const deleteWebhookSchema = z.object({
  uuid: z.string().uuid().describe("UUID вебхука для удаления"),
});

export async function handleCreateWebhook(
  params: z.infer<typeof createWebhookSchema>
): Promise<string> {
  const result = (await getClient().post("/webhooks", params)) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: { uuid: string; url: string; type: string };
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка создания вебхука: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    uuid: result.entity?.uuid,
    url: result.entity?.url,
    тип: result.entity?.type,
    статус_запроса: result.requests?.[0]?.state,
    сообщение: "Вебхук создан. СДЭК будет отправлять POST-уведомления на указанный URL.",
  }, null, 2);
}

export async function handleDeleteWebhook(
  params: z.infer<typeof deleteWebhookSchema>
): Promise<string> {
  const result = (await getClient().delete(`/webhooks/${params.uuid}`)) as {
    errors?: Array<{ code: string; message: string }>;
    requests?: Array<{ state: string }>;
  };

  if (result.errors?.length) {
    return `Ошибка удаления: ${result.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  return JSON.stringify({
    статус: result.requests?.[0]?.state,
    сообщение: `Вебхук ${params.uuid} удалён.`,
  }, null, 2);
}
