import { z } from "zod";
import { SallaClient } from "../client.js";

const client = new SallaClient();

export const listOrderStatusesSchema = z.object({});

export async function handleListOrderStatuses(
  _params: z.infer<typeof listOrderStatusesSchema>,
): Promise<string> {
  const result = await client.request("GET", "/orders/statuses");
  return JSON.stringify(result, null, 2);
}
