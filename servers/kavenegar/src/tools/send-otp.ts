import { randomInt } from "node:crypto";
import { z } from "zod";
import { getClient } from "../client.js";
export const sendOtpSchema = z.object({
  receptor: z.string().describe("Recipient phone number"),
  template: z.string().describe("OTP template name registered in Kavenegar panel"),
});

export async function handleSendOtp(params: z.infer<typeof sendOtpSchema>): Promise<string> {
  const result = await getClient().get("verify/lookup.json", {
    receptor: params.receptor,
    template: params.template,
    // ponytail: CSPRNG — Math.random is predictable, and this is an auth code.
    token: randomInt(100000, 1000000).toString(),
    type: "sms",
  });
  return JSON.stringify(result, null, 2);
}
