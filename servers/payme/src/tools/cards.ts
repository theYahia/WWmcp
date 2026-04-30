import { z } from "zod";
import type { JsonRpcClient } from "../client.js";

export const cardTools = [
  {
    name: "cards_create",
    description:
      "Create (tokenize) a payment card for Payme. Returns a token for subsequent operations like verify, pay, and remove. Card number must be 8600-series (UzCard) or 5614-series (Humo). In sandbox mode, use expiry 03/99 (0399).",
    inputSchema: {
      number: z.string().describe("Card number (8600 series for UzCard, 5614 for Humo)"),
      expire: z.string().describe("Expiry in MMYY format, e.g. 0399 for 03/99"),
    },
    method: "cards.create",
    buildParams: (args: { number: string; expire: string }) => ({
      card: { number: args.number, expire: args.expire },
    }),
  },
  {
    name: "cards_verify",
    description:
      "Verify a previously tokenized card with SMS code sent to the cardholder phone. This step is required before the card can be used for payments. In sandbox mode, the verification code is always 666666.",
    inputSchema: {
      token: z.string().describe("Card token from cards_create"),
      code: z.string().describe("SMS verification code (666666 in sandbox)"),
    },
    method: "cards.verify",
    buildParams: (args: { token: string; code: string }) => ({
      token: args.token,
      code: args.code,
    }),
  },
  {
    name: "cards_check",
    description:
      "Check if a card token is still valid and active in Payme. Use this before attempting a payment to avoid errors. Returns the card status and details.",
    inputSchema: {
      token: z.string().describe("Card token to check"),
    },
    method: "cards.check",
    buildParams: (args: { token: string }) => ({
      token: args.token,
    }),
  },
  {
    name: "cards_remove",
    description:
      "Remove (delete) a previously tokenized card from Payme. After removal, the token becomes invalid and cannot be used for payments. This action is irreversible.",
    inputSchema: {
      token: z.string().describe("Card token to remove"),
    },
    method: "cards.remove",
    buildParams: (args: { token: string }) => ({
      token: args.token,
    }),
  },
] as const;

export type CardToolName = (typeof cardTools)[number]["name"];

export async function handleCardTool(
  name: string,
  args: Record<string, unknown>,
  client: JsonRpcClient,
): Promise<unknown> {
  const tool = cardTools.find((t) => t.name === name);
  if (!tool) throw new Error(`Unknown card tool: ${name}`);
  const params = tool.buildParams(args as never);
  return client.call(tool.method, params);
}
