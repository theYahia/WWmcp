import { z } from "zod";
import { getClient, formatResult } from "./util.js";

// Replaces the ENTIRE weekly schedule (bulk). Days not sent are removed (store
// closed that day). For temporary pauses use the interruptions tools instead.
// Returns 201.
const shiftSchema = z.object({
  dayOfWeek: z
    .enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"])
    .describe("Day of week"),
  start: z.string().describe("Shift start, 'HH:mm:ss' (e.g. '09:00:00')."),
  duration: z.number().int().positive().describe("Shift duration in minutes (e.g. 360 = 6h)."),
});

export const set_opening_hoursSchema = z.object({
  merchant_id: z.string().describe("Merchant ID"),
  storeId: z.string().describe("Store ID for the schedule payload."),
  shifts: z.array(shiftSchema).min(1).describe("Full weekly shift list — replaces all existing hours."),
});

export async function handleSetOpeningHours(
  params: z.infer<typeof set_opening_hoursSchema>,
): Promise<string> {
  const result = await getClient().request(
    "PUT",
    `/merchant/v1.0/merchants/${params.merchant_id}/opening-hours`,
    { storeId: params.storeId, shifts: params.shifts },
    { retryOnWrite: true },
  );
  return formatResult(result, "Opening hours updated (201).");
}
