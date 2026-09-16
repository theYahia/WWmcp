import { z } from "zod";
import { getClient } from "../client.js";
export const lookupSchema = z.object({
  receptor: z.string().describe("Recipient phone number"),
  template: z.string().describe("Template name registered in Kavenegar panel"),
  tokens: z.array(z.string()).min(1).max(3).describe("Token values (token, token2, token3)"),
});

export async function handleLookup(params: z.infer<typeof lookupSchema>): Promise<string> {
  const p: Record<string, string> = {
    receptor: params.receptor,
    template: params.template,
    token: params.tokens[0],
  };
  if (params.tokens[1]) p.token2 = params.tokens[1];
  if (params.tokens[2]) p.token3 = params.tokens[2];
  const result = await getClient().get("verify/lookup.json", p);
  return JSON.stringify(result, null, 2);
}
