import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { writeFile, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Fake fetch responses. OAuth calls return a token; API calls return whatever is queued.
const OAUTH = { access_token: "T", expires_at: 9_999_999_999_999 };

function res(status: number, opts: { json?: unknown; arrayBuffer?: ArrayBuffer; ok?: boolean } = {}) {
  return {
    ok: opts.ok ?? (status >= 200 && status < 300),
    status,
    statusText: String(status),
    json: async () => opts.json ?? {},
    text: async () => JSON.stringify(opts.json ?? {}),
    arrayBuffer: async () => opts.arrayBuffer ?? new ArrayBuffer(0),
  } as unknown as Response;
}

function wavBuffer(rate = 16000): Buffer {
  const b = Buffer.alloc(44);
  b.write("RIFF", 0, "ascii");
  b.writeUInt32LE(36, 4);
  b.write("WAVE", 8, "ascii");
  b.write("fmt ", 12, "ascii");
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write("data", 36, "ascii");
  b.writeUInt32LE(0, 40);
  return b;
}

let originalFetch: typeof globalThis.fetch;
let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = { ...process.env };
  originalFetch = global.fetch;
  process.env.SALUTESPEECH_API_KEY = "dGVzdA==";
  vi.resetModules();
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env = originalEnv;
  vi.restoreAllMocks();
});

function apiCallOf(mock: ReturnType<typeof vi.fn>): [string, RequestInit] {
  const call = mock.mock.calls.find((c) => String(c[0]).includes("smartspeech.sber.ru"));
  if (!call) throw new Error("no API call was made");
  return [String(call[0]), (call[1] ?? {}) as RequestInit];
}

function headerOf(init: RequestInit, name: string): string | undefined {
  return (init.headers as Record<string, string> | undefined)?.[name];
}

describe("synthesize_speech handler", () => {
  it("POSTs to /text:synthesize (NOT /speech:synthesize) with application/text", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth")
        ? res(200, { json: OAUTH })
        : res(200, { arrayBuffer: new TextEncoder().encode("AUDIO").buffer }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { handleSynthesizeSpeech } = await import("../src/tools/synthesize.js");
    const out = JSON.parse(await handleSynthesizeSpeech({ text: "привет", voice: "Bys_24000", format: "opus" }));

    const [url, init] = apiCallOf(fetchMock);
    expect(url).toContain("/text:synthesize");
    expect(url).not.toContain("/speech:synthesize");
    expect(url).toContain("voice=Bys_24000");
    expect(url).toContain("format=opus");
    expect(headerOf(init, "Content-Type")).toBe("application/text");
    expect(out.size_bytes).toBe(5);
  });
});

describe("recognize_speech handler", () => {
  it("converts audio/wav to audio/x-pcm with the detected rate", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth")
        ? res(200, { json: OAUTH })
        : res(200, { json: { result: ["привет"], emotions: [], status: 200 } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { handleRecognizeSpeech } = await import("../src/tools/recognize.js");
    const out = JSON.parse(
      await handleRecognizeSpeech({
        audio_base64: wavBuffer(16000).toString("base64"),
        content_type: "audio/wav",
        language: "ru-RU",
      }),
    );

    const [url, init] = apiCallOf(fetchMock);
    expect(url).toContain("/speech:recognize");
    expect(url).toContain("language=ru-RU");
    expect(headerOf(init, "Content-Type")).toBe("audio/x-pcm;bit=16;rate=16000");
    expect(out.text).toBe("привет");
  });

  it("passes container content types through unchanged", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth") ? res(200, { json: OAUTH }) : res(200, { json: { result: ["ok"] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const { handleRecognizeSpeech } = await import("../src/tools/recognize.js");
    await handleRecognizeSpeech({
      audio_base64: Buffer.from("oggdata").toString("base64"),
      content_type: "audio/ogg;codecs=opus",
      language: "ru-RU",
    });

    const [, init] = apiCallOf(fetchMock);
    expect(headerOf(init, "Content-Type")).toBe("audio/ogg;codecs=opus");
  });

  it("rejects oversize audio before any network call", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { handleRecognizeSpeech } = await import("../src/tools/recognize.js");
    const { MAX_SYNC_AUDIO_BYTES } = await import("../src/audio.js");
    const big = Buffer.alloc(MAX_SYNC_AUDIO_BYTES + 1).toString("base64");

    await expect(
      handleRecognizeSpeech({ audio_base64: big, content_type: "audio/mpeg", language: "ru-RU" }),
    ).rejects.toThrow(/exceeds the 2 MB/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("recognize_file handler", () => {
  it("maps .flac to audio/flac (not audio/x-flac)", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth") ? res(200, { json: OAUTH }) : res(200, { json: { result: ["ok"] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const tmp = join(tmpdir(), `salutespeech-test-${process.pid}.flac`);
    await writeFile(tmp, Buffer.from("fLaC fake flac payload"));
    try {
      const { handleRecognizeFile } = await import("../src/tools/recognize-file.js");
      const out = JSON.parse(await handleRecognizeFile({ file_path: tmp, language: "ru-RU" }));
      const [url, init] = apiCallOf(fetchMock);
      expect(url).toContain("/speech:recognize");
      expect(headerOf(init, "Content-Type")).toBe("audio/flac");
      expect(out.content_type).toBe("audio/flac");
    } finally {
      await unlink(tmp);
    }
  });

  it("maps a .wav file to audio/x-pcm with the header rate", async () => {
    const fetchMock = vi.fn(async (url: string) =>
      String(url).includes("oauth") ? res(200, { json: OAUTH }) : res(200, { json: { result: ["ok"] } }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    const tmp = join(tmpdir(), `salutespeech-test-${process.pid}.wav`);
    await writeFile(tmp, wavBuffer(8000));
    try {
      const { handleRecognizeFile } = await import("../src/tools/recognize-file.js");
      await handleRecognizeFile({ file_path: tmp, language: "ru-RU" });
      const [, init] = apiCallOf(fetchMock);
      expect(headerOf(init, "Content-Type")).toBe("audio/x-pcm;bit=16;rate=8000");
    } finally {
      await unlink(tmp);
    }
  });

  it("requires sample_rate for headerless .pcm", async () => {
    const fetchMock = vi.fn(async () => res(200, { json: OAUTH }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const tmp = join(tmpdir(), `salutespeech-test-${process.pid}.pcm`);
    await writeFile(tmp, Buffer.from([0, 0, 0, 0]));
    try {
      const { handleRecognizeFile } = await import("../src/tools/recognize-file.js");
      await expect(handleRecognizeFile({ file_path: tmp, language: "ru-RU" })).rejects.toThrow(/sample_rate/);
    } finally {
      await unlink(tmp);
    }
  });
});
