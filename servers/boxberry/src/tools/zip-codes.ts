import { z } from "zod";
import { BoxberryClient } from "../client.js";

const client = new BoxberryClient();

export const zipCodesSchema = z.object({
  zip: z.string().describe("Почтовый индекс для проверки зоны доставки Boxberry"),
});

export async function handleZipCodes(params: z.infer<typeof zipCodesSchema>): Promise<string> {
  const result = (await client.call("ZipCheck", {
    Zip: params.zip,
  })) as Array<{ ExpressDelivery: string; ZoneExpressDelivery: string; ReceptionLaP: string; DeliveryLaP: string }>;

  if (!Array.isArray(result) || result.length === 0) {
    return `Индекс ${params.zip} не входит в зону доставки Boxberry.`;
  }

  return JSON.stringify({
    индекс: params.zip,
    зона_доставки: result.map(z => ({
      экспресс_доставка: z.ExpressDelivery === "1" ? "да" : "нет",
      зона_экспресс: z.ZoneExpressDelivery,
      приём_от_ИМ: z.ReceptionLaP === "1" ? "да" : "нет",
      доставка_от_ИМ: z.DeliveryLaP === "1" ? "да" : "нет",
    })),
  }, null, 2);
}
