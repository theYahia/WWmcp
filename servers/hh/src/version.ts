import { createRequire } from "node:module";

// Single-source the version from package.json so the MCP handshake, the
// User-Agent and the /health endpoint never drift from the published version.
// `createRequire` resolves at runtime, so this works in both dev (src/) and the
// published package (dist/ sits at the tarball root, next to package.json).
const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version: string };

export const VERSION: string = pkg.version;
