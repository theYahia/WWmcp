/**
 * Backward-compatible re-exports for v1.x importers.
 *
 * As of v1.1.0 (refactor) the tool registry is split across `src/tools/`
 * modules (products, stock, orders, seller-account, analytics, webhooks).
 * This file just re-exports the aggregated registry from `tools/index.ts`
 * so existing imports like `import { handleTool } from "./tools.js"`
 * continue to compile and run unchanged.
 */
export { toolDefinitions, handleTool, type ToolName } from "./tools/index.js";
