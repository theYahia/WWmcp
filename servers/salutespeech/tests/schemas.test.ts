import { describe, it, expect } from "vitest";
import { recognizeSpeechSchema } from "../src/tools/recognize.js";
import { synthesizeSpeechSchema } from "../src/tools/synthesize.js";
import { listModelsSchema } from "../src/tools/list-models.js";
import { getTaskStatusSchema } from "../src/tools/get-task-status.js";
import { recognizeFileSchema } from "../src/tools/recognize-file.js";

describe("zod schemas", () => {
  it("recognizeSpeechSchema validates valid input", () => {
    const result = recognizeSpeechSchema.safeParse({ audio_base64: "dGVzdA==" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.content_type).toBe("audio/wav");
      expect(result.data.language).toBe("ru-RU");
    }
  });

  it("recognizeSpeechSchema rejects missing audio", () => {
    const result = recognizeSpeechSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("synthesizeSpeechSchema validates valid input", () => {
    const result = synthesizeSpeechSchema.safeParse({ text: "Привет" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.voice).toBe("Nec_24000");
      expect(result.data.format).toBe("opus");
    }
  });

  it("synthesizeSpeechSchema rejects missing text", () => {
    const result = synthesizeSpeechSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("synthesizeSpeechSchema enforces 1..4000 char bounds", () => {
    expect(synthesizeSpeechSchema.safeParse({ text: "" }).success).toBe(false);
    expect(synthesizeSpeechSchema.safeParse({ text: "a".repeat(4000) }).success).toBe(true);
    expect(synthesizeSpeechSchema.safeParse({ text: "a".repeat(4001) }).success).toBe(false);
  });

  it("listModelsSchema defaults to all", () => {
    const result = listModelsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("all");
    }
  });

  it("getTaskStatusSchema requires task_id", () => {
    expect(getTaskStatusSchema.safeParse({}).success).toBe(false);
    expect(getTaskStatusSchema.safeParse({ task_id: "abc-123" }).success).toBe(true);
  });

  it("recognizeFileSchema validates file_path", () => {
    const result = recognizeFileSchema.safeParse({ file_path: "/tmp/audio.wav" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.language).toBe("ru-RU");
    }
  });

  it("recognizeFileSchema rejects missing path", () => {
    expect(recognizeFileSchema.safeParse({}).success).toBe(false);
  });
});
