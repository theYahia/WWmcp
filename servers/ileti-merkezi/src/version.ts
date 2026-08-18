import { createRequire } from "node:module";

// Read the package version at runtime so the MCP server always advertises the
// same version as the published npm package (no hardcoded string to drift).
// At runtime this file lives in dist/, so ../package.json resolves to the
// package root. createRequire keeps package.json out of the tsc compilation.
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const VERSION: string = pkg.version;
export const SERVER_NAME = "ileti-merkezi-mcp";
