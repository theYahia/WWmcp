import { z } from "zod";
import { getClient } from "../client.js";

export const getIntegrationsSchema = z.object({});

export async function handleGetIntegrations(_params: z.infer<typeof getIntegrationsSchema>): Promise<string> {
  const result = (await getClient().get("/project/integration/list")) as {
    integrations: { title: string; type: string; status: string; settings?: Record<string, unknown> }[];
    status: string;
  };

  if (!result.integrations || result.integrations.length === 0) {
    return "Интеграции не найдены.";
  }

  return JSON.stringify({
    интеграции: result.integrations.map(i => ({
      название: i.title,
      тип: i.type,
      статус: i.status,
    })),
  }, null, 2);
}
