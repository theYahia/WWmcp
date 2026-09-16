/**
 * MCP tool annotations (behavioral hints, spec 2025-06-18).
 *
 * Clients use these to gate confirmation prompts: a banking server MUST let a
 * client tell read-only lookups apart from the money-moving payment tool.
 */

/** Read-only lookups that hit the external Alfa API. */
export const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

/** Money-moving, irreversible operation (payment order). */
export const PAYMENT = {
  readOnlyHint: false,
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: true,
} as const;
