import { z } from "zod";
import { formatResponse } from "@theyahia/mcp-core";
import { getClient } from "../client.js";

export const listItemsSchema = z.object({
  query: z.string().optional().describe("Поисковый запрос для фильтрации"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .describe("Количество результатов (1-100, по умолчанию 20)"),
  response_format: z
    .enum(["concise", "detailed"])
    .default("concise")
    .describe(
      "concise — основные поля (CSV); detailed — все поля (JSON)",
    ),
});

export async function handleListItems(
  params: z.infer<typeof listItemsSchema>,
): Promise<string> {
  const client = getClient();
  const data = (await client.get("/items", {
    ...(params.query && { q: params.query }),
    limit: String(params.limit),
  })) as { items: unknown[] };

  return formatResponse(data.items, {
    maxItems: params.limit,
    format: params.response_format,
  });
}
