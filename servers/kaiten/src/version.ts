import { createRequire } from "node:module";

/**
 * Single source of truth for the package version / name.
 *
 * We read it from package.json at runtime via createRequire (instead of a JSON
 * import assertion) so the same code works on Node 18, 20 and 22 — the `with`
 * / `assert` import-attribute syntax differs across those versions, while
 * `createRequire(...)("../package.json")` is stable everywhere.
 *
 * Resolves relative to the compiled module: dist/version.js -> ../package.json
 * (package root) in production, and src/version.ts -> ../package.json (repo
 * root) under tsx in development. Both point at the real package.json.
 */
const require = createRequire(import.meta.url);

interface PackageJson {
  name: string;
  version: string;
}

const pkg = require("../package.json") as PackageJson;

export const VERSION: string = pkg.version;
export const PKG_NAME: string = pkg.name;
