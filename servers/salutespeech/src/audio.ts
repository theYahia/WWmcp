// Audio helpers shared by the recognition tools.
//
// SaluteSpeech REST content-types and limits are documented at
// https://developers.sber.ru/docs/ru/salutespeech/guides/recognition/encodings and
// https://developers.sber.ru/docs/ru/salutespeech/recognition/recognition-sync

/** Synchronous /speech:recognize accepts at most 2 MB / 1 minute of audio. */
export const MAX_SYNC_AUDIO_BYTES = 2 * 1024 * 1024;

/**
 * Parse the sample rate (Hz) from a RIFF/WAVE header.
 * Scans chunks for "fmt " so non-canonical layouts still resolve.
 * Returns null if the buffer is not a recognizable WAV file.
 */
export function wavSampleRate(buf: Buffer): number | null {
  if (buf.length < 44) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF") return null;
  if (buf.toString("ascii", 8, 12) !== "WAVE") return null;

  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      const dataOff = off + 8;
      // fmt data: audioFormat(2) numChannels(2) sampleRate(4)
      if (dataOff + 8 > buf.length) return null;
      const rate = buf.readUInt32LE(dataOff + 4);
      return rate > 0 ? rate : null;
    }
    off += 8 + size + (size % 2); // chunks are word-aligned
  }
  return null;
}

/** Content-Type for raw/headered PCM signed 16-bit little-endian at the given rate. */
export function pcmContentType(sampleRate: number): string {
  return `audio/x-pcm;bit=16;rate=${sampleRate}`;
}

/** Throw a friendly, actionable error when audio is too large for the sync endpoint. */
export function assertSyncSize(byteLength: number): void {
  if (byteLength > MAX_SYNC_AUDIO_BYTES) {
    const mb = (byteLength / (1024 * 1024)).toFixed(1);
    throw new Error(
      `Audio is ${mb} MB, which exceeds the 2 MB / 1 minute limit of the synchronous ` +
        `SaluteSpeech recognition endpoint (returns HTTP 413). For longer audio use the ` +
        `asynchronous flow (data:upload -> speech:async_recognize -> task:get -> data:download).`,
    );
  }
}

interface RawRecognition {
  result?: unknown;
  emotions?: unknown;
  status?: unknown;
  [k: string]: unknown;
}

/**
 * Shape the raw SaluteSpeech recognition JSON into a model-friendly object:
 * a flat `text` transcript plus structured extras and the untouched `raw` body.
 * The transcript lives in `result` (an array of hypotheses); join with spaces.
 */
export function formatRecognitionResult(
  raw: RawRecognition,
  extra: Record<string, unknown> = {},
): string {
  const text = Array.isArray(raw.result) ? raw.result.join(" ") : "";
  return JSON.stringify({ text, emotions: raw.emotions, ...extra, raw }, null, 2);
}
