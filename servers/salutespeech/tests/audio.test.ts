import { describe, it, expect } from "vitest";
import {
  MAX_SYNC_AUDIO_BYTES,
  assertSyncSize,
  formatRecognitionResult,
  pcmContentType,
  wavSampleRate,
} from "../src/audio.js";

function wavBuffer(rate = 16000): Buffer {
  const b = Buffer.alloc(44);
  b.write("RIFF", 0, "ascii");
  b.writeUInt32LE(36, 4);
  b.write("WAVE", 8, "ascii");
  b.write("fmt ", 12, "ascii");
  b.writeUInt32LE(16, 16); // subchunk1 size
  b.writeUInt16LE(1, 20); // PCM
  b.writeUInt16LE(1, 22); // mono
  b.writeUInt32LE(rate, 24); // sample rate
  b.writeUInt32LE(rate * 2, 28); // byte rate
  b.writeUInt16LE(2, 32); // block align
  b.writeUInt16LE(16, 34); // bits per sample
  b.write("data", 36, "ascii");
  b.writeUInt32LE(0, 40);
  return b;
}

describe("wavSampleRate", () => {
  it("reads the sample rate from a WAV header", () => {
    expect(wavSampleRate(wavBuffer(16000))).toBe(16000);
    expect(wavSampleRate(wavBuffer(8000))).toBe(8000);
    expect(wavSampleRate(wavBuffer(48000))).toBe(48000);
  });

  it("returns null for non-WAV buffers", () => {
    expect(wavSampleRate(Buffer.from("not a wav file at all....."))).toBeNull();
    expect(wavSampleRate(Buffer.alloc(10))).toBeNull();
  });
});

describe("pcmContentType", () => {
  it("formats the PCM content type", () => {
    expect(pcmContentType(16000)).toBe("audio/x-pcm;bit=16;rate=16000");
  });
});

describe("assertSyncSize", () => {
  it("passes for small audio", () => {
    expect(() => assertSyncSize(1024)).not.toThrow();
    expect(() => assertSyncSize(MAX_SYNC_AUDIO_BYTES)).not.toThrow();
  });

  it("throws an actionable error over 2 MB", () => {
    expect(() => assertSyncSize(MAX_SYNC_AUDIO_BYTES + 1)).toThrow(/exceeds the 2 MB/);
    expect(() => assertSyncSize(MAX_SYNC_AUDIO_BYTES + 1)).toThrow(/async/i);
  });
});

describe("formatRecognitionResult", () => {
  it("flattens result[] into a text transcript and keeps raw + extras", () => {
    const raw = { result: ["привет", "мир"], emotions: [{ neutral: 1 }], status: 200 };
    const out = JSON.parse(formatRecognitionResult(raw, { content_type: "audio/mpeg" }));
    expect(out.text).toBe("привет мир");
    expect(out.emotions).toEqual([{ neutral: 1 }]);
    expect(out.content_type).toBe("audio/mpeg");
    expect(out.raw).toEqual(raw);
  });

  it("yields empty text when result is absent", () => {
    const out = JSON.parse(formatRecognitionResult({ status: 400 }));
    expect(out.text).toBe("");
  });
});
