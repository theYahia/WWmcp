import { z } from "zod";

export const listModelsSchema = z.object({
  type: z.enum(["recognition", "synthesis", "all"]).default("all").describe("Filter by model type: recognition, synthesis, or all"),
});

const RECOGNITION_MODELS = [
  { name: "general", sample_rate: 16000, languages: ["ru-RU"], description: "General-purpose Russian recognition" },
  { name: "general", sample_rate: 8000, languages: ["ru-RU"], description: "General-purpose Russian (8kHz, telephony)" },
  { name: "general", sample_rate: 16000, languages: ["en-US"], description: "General-purpose English recognition" },
  { name: "general", sample_rate: 16000, languages: ["kk-KZ"], description: "General-purpose Kazakh recognition" },
];

// Voice id = <speaker>_<rate>. Every speaker ships in 24000 Hz and 8000 Hz (telephony).
const SPEAKERS = [
  { code: "Nec", speaker: "Наталья", gender: "female", language: "ru-RU" },
  { code: "Bys", speaker: "Борис", gender: "male", language: "ru-RU" },
  { code: "May", speaker: "Марфа", gender: "female", language: "ru-RU" },
  { code: "Tur", speaker: "Тарас", gender: "male", language: "ru-RU" },
  { code: "Ost", speaker: "Александра", gender: "female", language: "ru-RU" },
  { code: "Pon", speaker: "Сергей", gender: "male", language: "ru-RU" },
  { code: "Kin", speaker: "Kira", gender: "female", language: "en-US" },
];

const SYNTHESIS_VOICES = SPEAKERS.flatMap((s) =>
  [24000, 8000].map((rate) => ({
    name: `${s.code}_${rate}`,
    speaker: s.speaker,
    gender: s.gender,
    language: s.language,
    sample_rate: rate,
    description: `${s.speaker} (${s.language}${rate === 8000 ? ", 8kHz telephony" : ""})`,
  })),
);

const SYNTHESIS_NOTE =
  "Sample rate is set by the voice id suffix (24000/8000), not by the format. Languages other than the " +
  "voice's own (12 supported, incl. Kazakh) are selected via SSML lang markup, not a separate voice id.";

export async function handleListModels(params: z.infer<typeof listModelsSchema>): Promise<string> {
  const result: Record<string, unknown> = {};
  if (params.type === "recognition" || params.type === "all") {
    result.recognition_models = RECOGNITION_MODELS;
  }
  if (params.type === "synthesis" || params.type === "all") {
    result.synthesis_voices = SYNTHESIS_VOICES;
    result.synthesis_formats = ["opus", "wav16", "pcm16", "alaw"];
    result.synthesis_note = SYNTHESIS_NOTE;
  }
  return JSON.stringify(result, null, 2);
}
