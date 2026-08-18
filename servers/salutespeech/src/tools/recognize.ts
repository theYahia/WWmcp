import { z } from "zod";
import { salutePost } from "../client.js";
import { assertSyncSize, formatRecognitionResult, pcmContentType, wavSampleRate } from "../audio.js";

export const recognizeSpeechSchema = z.object({
  audio_base64: z.string().describe("Audio data in Base64 encoding"),
  content_type: z
    .string()
    .default("audio/wav")
    .describe(
      "Audio MIME type. Valid SaluteSpeech values: audio/ogg;codecs=opus, audio/mpeg, audio/flac, " +
        "audio/x-pcm;bit=16;rate=<Hz>. Pass audio/wav and the sample rate is auto-detected from the header.",
    ),
  language: z.string().default("ru-RU").describe("Recognition language (ru-RU, en-US, kk-KZ)"),
});

// SaluteSpeech has no audio/wav content-type; map WAV -> PCM (rate from header),
// and reject bare audio/x-pcm (it needs an explicit ;rate=). Everything else passes through.
function normalizeContentType(contentType: string, buffer: Buffer): string {
  const ct = contentType.trim();
  const lower = ct.toLowerCase();
  if (lower === "audio/wav" || lower === "audio/x-wav" || lower === "audio/wave") {
    const rate = wavSampleRate(buffer);
    if (!rate) {
      throw new Error(
        'content_type=audio/wav but the WAV header could not be parsed. Send raw PCM with ' +
          'content_type="audio/x-pcm;bit=16;rate=<sampleRate>" instead.',
      );
    }
    return pcmContentType(rate);
  }
  if (lower === "audio/x-pcm" || lower === "audio/pcm") {
    throw new Error(
      'Raw PCM requires a sample rate: use content_type="audio/x-pcm;bit=16;rate=<sampleRate>".',
    );
  }
  return ct;
}

export async function handleRecognizeSpeech(params: z.infer<typeof recognizeSpeechSchema>): Promise<string> {
  const audioBuffer = Buffer.from(params.audio_base64, "base64");
  assertSyncSize(audioBuffer.byteLength);

  const contentType = normalizeContentType(params.content_type, audioBuffer);
  const response = await salutePost(
    `/speech:recognize?language=${encodeURIComponent(params.language)}`,
    audioBuffer,
    contentType,
  );
  const result = await response.json();
  return formatRecognitionResult(result, { content_type: contentType });
}
