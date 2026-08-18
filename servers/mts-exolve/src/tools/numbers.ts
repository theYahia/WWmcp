import { z } from "zod";
import { exolvePost } from "../client.js";

export const listNumbersSchema = z.object({});

export async function handleListNumbers(): Promise<string> {
  const result = await exolvePost("/number/list", {});
  return JSON.stringify(result, null, 2);
}

export const buyNumberSchema = z.object({
  region: z.string().describe("Регион (например, moscow, spb)"),
  type: z.string().default("mobile").describe("Тип номера (mobile, local, tollfree)"),
});

export async function handleBuyNumber(params: z.infer<typeof buyNumberSchema>): Promise<string> {
  const result = await exolvePost("/number/buy", {
    region: params.region,
    type: params.type,
  });
  return JSON.stringify(result, null, 2);
}
