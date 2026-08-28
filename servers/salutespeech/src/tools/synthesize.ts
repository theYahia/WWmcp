import { z } from "zod";
import { salutePost } from "../client.js";

export const synthesizeSpeechSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(4000)
    .describe("Text to synthesize (max 4000 chars incl. spaces/markup)"),
  voice: z
    .string()
    .default("Nec_24000")
    .describe(
      "Voice id <speaker>_<rate>. Speakers: Nec (Наталья), Bys (Борис), May (Марфа), Tur (Тарас), " +
        "Ost (Александра), Pon (Сергей), Kin (Kira, English). Rate suffix 24000 or 8000 (telephony) " +
        "sets the sample rate. Other languages are selected via SSML lang, not the voice id.",
    ),
  format: z
    .string()
    .default("opus")
    .describe("Audio container/codec: opus, wav16, pcm16, alaw (sample rate comes from the voice suffix)"),
});

export async function handleSynthesizeSpeech(params: z.infer<typeof synthesizeSpeechSchema>): Promise<string> {
  const response = await salutePost(
    `/text:synthesize?voice=${encodeURIComponent(params.voice)}&format=${encodeURIComponent(params.format)}`,
    params.text,
    "application/text",
  );
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return JSON.stringify({
    audio_base64: base64,
    format: params.format,
    voice: params.voice,
    size_bytes: arrayBuffer.byteLength,
  }, null, 2);
}
