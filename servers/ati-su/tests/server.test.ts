/**
 * Tests for server bootstrap (index.ts).
 */

import { describe, it, expect, afterEach } from "vitest";
import { buildServer, packageVersion, SERVER_INSTRUCTIONS } from "../src/index.js";
import pkg from "../package.json";

afterEach(() => {
  delete process.env.ATI_TOKEN;
});

describe("server bootstrap", () => {
  it("reports the version from package.json (no drift)", () => {
    expect(packageVersion()).toBe((pkg as { version: string }).version);
  });

  it("builds without throwing and exposes domain instructions", () => {
    process.env.ATI_TOKEN = "x";
    expect(() => buildServer()).not.toThrow();
    expect(SERVER_INSTRUCTIONS).toMatch(/ATI\.su/);
    expect(SERVER_INSTRUCTIONS).toMatch(/resolve_city/);
  });
});
