import { z } from "zod";
import { getClient } from "../client.js";

export const printReceiptSchema = z.object({
  order_uuid: z.string().describe("UUID заказа для печати квитанции"),
  copy_count: z.number().int().min(1).max(10).default(1)
    .describe("Количество копий (1-10)"),
});

export async function handlePrintReceipt(
  params: z.infer<typeof printReceiptSchema>
): Promise<string> {
  const createResult = (await getClient().post("/print/orders", {
    orders: [{ order_uuid: params.order_uuid }],
    copy_count: params.copy_count,
  })) as {
    errors?: Array<{ code: string; message: string }>;
    entity?: { uuid: string };
  };

  if (createResult.errors?.length) {
    return `Ошибка создания квитанции: ${createResult.errors.map(e => `[${e.code}] ${e.message}`).join("; ")}`;
  }

  const printUuid = createResult.entity?.uuid;
  if (!printUuid) return "Не удалось создать квитанцию: UUID не получен.";

  // Polling — квитанция формируется асинхронно (до 10 сек)
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const getResult = (await getClient().get(`/print/orders/${printUuid}`)) as {
      entity?: { url?: string; statuses?: Array<{ code: string; name: string }> };
    };

    if (getResult.entity?.url) {
      return JSON.stringify({
        uuid: printUuid,
        url: getResult.entity.url,
        сообщение: "Квитанция готова к скачиванию.",
      }, null, 2);
    }

    const status = getResult.entity?.statuses?.[0];
    if (status?.code === "FAIL") {
      return `Ошибка формирования квитанции: ${status.name}`;
    }
  }

  return JSON.stringify({
    uuid: printUuid,
    сообщение: "Квитанция формируется. Проверьте позже по UUID.",
  }, null, 2);
}
