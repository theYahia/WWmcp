import { z } from "zod";
import { exolvePost } from "../client.js";

export const makeCallSchema = z.object({
  from: z.string().describe("Номер звонящего"),
  to: z.string().describe("Номер вызываемого абонента"),
});

export async function handleMakeCall(params: z.infer<typeof makeCallSchema>): Promise<string> {
  const result = await exolvePost("/call/make", {
    from: params.from,
    to: params.to,
  });
  return JSON.stringify(result, null, 2);
}

export const getCallStatusSchema = z.object({
  call_id: z.string().describe("ID звонка"),
});

export async function handleGetCallStatus(params: z.infer<typeof getCallStatusSchema>): Promise<string> {
  const result = await exolvePost("/call/status", {
    call_id: params.call_id,
  });
  return JSON.stringify(result, null, 2);
}

export const getCallRecordingSchema = z.object({
  call_id: z.string().describe("ID звонка для получения записи"),
});

export async function handleGetCallRecording(params: z.infer<typeof getCallRecordingSchema>): Promise<string> {
  const result = await exolvePost("/call/recording", {
    call_id: params.call_id,
  });
  return JSON.stringify(result, null, 2);
}
