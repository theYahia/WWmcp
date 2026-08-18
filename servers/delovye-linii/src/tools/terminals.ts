import { z } from "zod";
import { DellinClient } from "../client.js";

let client: DellinClient;
function getClient() { return client ??= new DellinClient(); }

export const getTerminalsSchema = z.object({
  city_id: z.number().describe("ID города для поиска терминалов (из get_cities)"),
});

export async function handleGetTerminals(params: z.infer<typeof getTerminalsSchema>): Promise<string> {
  const result = (await getClient().post("/terminals", {
    cityID: params.city_id,
  })) as {
    terminals?: Array<{
      id: number;
      name: string;
      address: string;
      cityID: number;
      latitude?: number;
      longitude?: number;
      workingHours?: string;
      phones?: string[];
    }>;
  };

  const terminals = result.terminals;
  if (!terminals || terminals.length === 0) {
    return `Терминалы в городе (ID: ${params.city_id}) не найдены.`;
  }

  return JSON.stringify(
    terminals.slice(0, 20).map((t) => ({
      id: t.id,
      название: t.name,
      адрес: t.address,
      часы_работы: t.workingHours ?? "не указаны",
      телефоны: t.phones ?? [],
      координаты: t.latitude && t.longitude ? { lat: t.latitude, lng: t.longitude } : null,
    })),
    null,
    2,
  );
}
