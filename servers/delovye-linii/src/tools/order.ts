import { z } from "zod";
import { DellinClient } from "../client.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const createOrderSchema = z.object({
  sender_city_id: z.number().describe("ID города отправителя"),
  sender_terminal_id: z.number().optional().describe("ID терминала отправления (если сдача на терминал)"),
  sender_address: z.string().optional().describe("Адрес забора груза (если забор от двери)"),
  receiver_city_id: z.number().describe("ID города получателя"),
  receiver_terminal_id: z.number().optional().describe("ID терминала получения (если выдача с терминала)"),
  receiver_address: z.string().optional().describe("Адрес доставки (если до двери)"),
  cargo_weight: z.number().positive().describe("Вес груза в кг"),
  cargo_length: z.number().positive().optional().describe("Длина в м"),
  cargo_width: z.number().positive().optional().describe("Ширина в м"),
  cargo_height: z.number().positive().optional().describe("Высота в м"),
  cargo_quantity: z.number().int().positive().default(1).describe("Количество мест"),
  cargo_description: z.string().optional().describe("Описание груза"),
  sender_name: z.string().describe("ФИО отправителя"),
  sender_phone: z.string().describe("Телефон отправителя"),
  receiver_name: z.string().describe("ФИО получателя"),
  receiver_phone: z.string().describe("Телефон получателя"),
});

export async function handleCreateOrder(params: z.infer<typeof createOrderSchema>): Promise<string> {
  const cargo: Record<string, unknown> = {
    weight: params.cargo_weight,
    quantity: params.cargo_quantity,
  };
  if (params.cargo_length) cargo.length = params.cargo_length;
  if (params.cargo_width) cargo.width = params.cargo_width;
  if (params.cargo_height) cargo.height = params.cargo_height;
  if (params.cargo_description) cargo.description = params.cargo_description;

  const derival: Record<string, unknown> = {
    city: { cityID: params.sender_city_id },
  };
  if (params.sender_terminal_id) derival.terminalID = params.sender_terminal_id;
  if (params.sender_address) derival.address = { street: params.sender_address };

  const arrival: Record<string, unknown> = {
    city: { cityID: params.receiver_city_id },
  };
  if (params.receiver_terminal_id) arrival.terminalID = params.receiver_terminal_id;
  if (params.receiver_address) arrival.address = { street: params.receiver_address };

  const result = (await getClient().post("/orders/create", {
    delivery: { derival, arrival },
    cargo,
    members: {
      sender: { name: params.sender_name, phone: params.sender_phone },
      receiver: { name: params.receiver_name, phone: params.receiver_phone },
    },
  })) as { data?: { orderNumber?: string; orderId?: string; state?: string } };

  if (!result.data) {
    return "Не удалось создать заказ. Проверьте параметры.";
  }

  return JSON.stringify(
    {
      номер_заказа: result.data.orderNumber,
      id_заказа: result.data.orderId,
      статус: result.data.state ?? "создан",
    },
    null,
    2,
  );
}
