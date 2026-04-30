import { z } from "zod";
import { gcPost } from "../client.js";
import type { GetCourseCreateUserResponse } from "../types.js";

export const createUserSchema = z.object({
  email: z.string().email().describe("User email"),
  first_name: z.string().optional().describe("First name"),
  last_name: z.string().optional().describe("Last name"),
  phone: z.string().optional().describe("Phone number"),
  city: z.string().optional().describe("City"),
  group_name: z.string().optional().describe("Group name to add user to"),
  deal_offer_code: z.string().optional().describe("Offer code to create a deal"),
});

export async function handleCreateUser(params: z.infer<typeof createUserSchema>): Promise<string> {
  const user: Record<string, unknown> = {
    email: params.email,
  };
  if (params.first_name) user.first_name = params.first_name;
  if (params.last_name) user.last_name = params.last_name;
  if (params.phone) user.phone = params.phone;
  if (params.city) user.city = params.city;

  const body: Record<string, unknown> = { user };
  if (params.group_name) {
    body.system = { ...(body.system as Record<string, unknown> ?? {}), addToGroup: params.group_name };
  }
  if (params.deal_offer_code) {
    body.system = { ...(body.system as Record<string, unknown> ?? {}), deal_offer_code: params.deal_offer_code };
  }

  const result = (await gcPost("/account/users", body)) as GetCourseCreateUserResponse;

  if (!result.success) {
    return `Error creating user: ${result.error_message || "unknown error"}`;
  }

  return JSON.stringify({
    success: true,
    user_id: result.result?.user_id,
    added_to_group: result.result?.added_to_group,
    deal_created: result.result?.added_to_deal,
  }, null, 2);
}
