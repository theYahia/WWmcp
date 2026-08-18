import { z } from "zod";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { salutePost } from "../client.js";
import { assertSyncSize, formatRecognitionResult, pcmContentType, wavSampleRate } from "../audio.js";

export const recognizeFileSchema = z.object({
  file_path: z.string().describe("Absolute path to the audio file to recognize"),
  language: z.string().default("ru-RU").describe("Recognition language (ru-RU, en-US, kk-KZ)"),
  sample_rate: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Sample rate in Hz — required for headerless .pcm/.alaw/.ulaw files (e.g. 16000, 8000)"),
});

// Content-Type values expected by SaluteSpeech for self-describing container formats.
// .wav/.pcm are resolved dynamically because they need ;bit=16;rate=<sr>.
const STATIC_EXT_TO_MIME: Record<string, string> = {
  ".ogg": "audio/ogg;codecs=opus",
  ".opus": "audio/ogg;codecs=opus",
  ".mp3": "audio/mpeg",
  ".flac": "audio/flac",
};

function resolveContentType(ext: string, buffer: Buffer, sampleRate?: number): string {
  if (STATIC_EXT_TO_MIME[ext]) return STATIC_EXT_TO_MIME[ext];

  switch (ext) {
    case ".wav": {
      // SaluteSpeech has no audio/wav content-type — a WAV file (PCM16 with header)
      // is sent under the PCM content-type; the rate comes from the WAV header.
      const rate = sampleRate ?? wavSampleRate(buffer);
      if (!rate) {
        throw new Error(
          "Could not read the sample rate from the WAV header. Pass sample_rate explicitly (e.g. 16000).",
        );
      }
      return pcmContentType(rate);
    }
    case ".pcm": {
      if (!sampleRate) {
        throw new Error("Headerless PCM requires sample_rate (e.g. 16000). Pass it explicitly.");
      }
      return pcmContentType(sampleRate);
    }
    case ".alaw":
      return `audio/pcma;rate=${sampleRate ?? 8000}`;
    case ".ulaw":
    case ".mulaw":
      return `audio/pcmu;rate=${sampleRate ?? 8000}`;
    default:
      // Best effort: treat unknown extensions as WAV-with-header / PCM.
      return pcmContentType(sampleRate ?? wavSampleRate(buffer) ?? 16000);
  }
}

export async function handleRecognizeFile(params: z.infer<typeof recognizeFileSchema>): Promise<string> {
  const fileBuffer = await readFile(params.file_path);
  assertSyncSize(fileBuffer.byteLength);

  const ext = extname(params.file_path).toLowerCase();
  const contentType = resolveContentType(ext, fileBuffer, params.sample_rate);

  const response = await salutePost(
    `/speech:recognize?language=${encodeURIComponent(params.language)}`,
    fileBuffer,
    contentType,
  );
  const result = await response.json();
  return formatRecognitionResult(result, { file: params.file_path, content_type: contentType });
}
