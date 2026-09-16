import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { StoredTokens } from "../types.js";

/**
 * Where OAuth tokens are persisted. Override with TOCHKA_TOKEN_STORE; defaults
 * to ~/.config/tochka-bank-mcp/tokens.json. The file is written 0600.
 */
export function defaultTokenStorePath(): string {
  return (
    process.env.TOCHKA_TOKEN_STORE ?? join(homedir(), ".config", "tochka-bank-mcp", "tokens.json")
  );
}

export function loadTokens(path = defaultTokenStorePath()): StoredTokens | null {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as StoredTokens;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: StoredTokens, path = defaultTokenStorePath()): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(tokens, null, 2), { mode: 0o600 });
  // mkdirSync/writeFileSync mode is subject to umask; force 0600 explicitly.
  try {
    chmodSync(path, 0o600);
  } catch {
    // chmod is a no-op / may throw on some filesystems (e.g. Windows) — ignore.
  }
}
