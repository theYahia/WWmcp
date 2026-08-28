import { z } from "zod";
import { PochtaClient } from "../client.js";

export const trackSchema = z.object({
  barcode: z.string().describe("Трек-номер (штрих-код) почтового отправления, например RA123456789RU"),
});

let _client: PochtaClient;
function client() { return _client ??= new PochtaClient(); }

export async function handleTrack(params: z.infer<typeof trackSchema>): Promise<string> {
  const result = await client().trackByBarcode(params.barcode);
  return JSON.stringify(result, null, 2);
}
