import { describe, expect, it } from "vitest";
import { redact } from "./redact.js";

describe("redact", () => {
  it("masks bearer tokens", () => {
    expect(redact("Authorization: Bearer abc.def-123")).toContain("Bearer ***");
    expect(redact("Bearer abc.def-123")).not.toContain("abc.def");
  });

  it("masks client_secret values", () => {
    expect(redact("client_secret=supersecretvalue")).not.toContain("supersecretvalue");
  });

  it("masks 20-digit account numbers keeping the last 4", () => {
    const out = redact("acct 40702810000000001234 here");
    expect(out).toContain("1234");
    expect(out).not.toContain("40702810000000001234");
  });

  it("masks INN keeping the last 4", () => {
    const out = redact("inn 7707083893");
    expect(out).not.toContain("7707083893");
    expect(out).toContain("3893");
  });

  it("masks BIK keeping the last 4", () => {
    const out = redact("bik 044525225");
    expect(out).not.toContain("044525225");
    expect(out).toContain("5225");
  });

  it("masks standalone JWTs", () => {
    expect(redact("token eyJhbGc.eyJzdWI.sig12345")).toContain("***jwt***");
  });

  it("stringifies non-string input", () => {
    expect(redact({ a: 1 })).toContain('"a"');
  });
});
