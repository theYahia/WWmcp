/**
 * Write-safety tools — registered only when ONEC_WRITE_MODE != off,
 * so the default 34-tool surface is unchanged.
 */

import { z } from "zod";
import { oneCRawWrite } from "../client.js";
import { approveOp, appendAudit, getWriteMode, takeRollback } from "../lib/write-safety.js";

// ──────────────────────────────────────────────────────────────
// approve_write — the human gate: binds one approval to one op_hash
// ──────────────────────────────────────────────────────────────

export const approveWriteSchema = z.object({
  op_hash: z
    .string()
    .regex(/^[0-9a-f]{16}$/, "op_hash must be the 16-hex value from the preview response")
    .describe("op_hash из preview-ответа пишущего инструмента"),
  reason: z
    .string()
    .optional()
    .describe("Кто и почему подтвердил — попадает в audit-ledger"),
});

export async function handleApproveWrite(
  params: z.infer<typeof approveWriteSchema>,
): Promise<string> {
  const mode = getWriteMode();
  if (mode !== "approval") {
    throw new Error(
      `approve_write requires ONEC_WRITE_MODE=approval (current: ${mode}). ` +
        "In preview mode every write is a dry-run and cannot be approved.",
    );
  }
  const ttl = approveOp(params.op_hash, params.reason);
  return JSON.stringify(
    {
      approved: params.op_hash,
      expires_in_sec: ttl,
      single_use: true,
      next_step:
        "Re-run the exact same tool call with identical arguments — it will execute once. " +
        "Any change to the arguments produces a different op_hash and needs a new approval.",
    },
    null,
    2,
  );
}

// ──────────────────────────────────────────────────────────────
// rollback_write — execute the stored inverse of a completed write
// ──────────────────────────────────────────────────────────────

export const rollbackWriteSchema = z.object({
  token: z
    .string()
    .describe("rollback.token из ответа выполненной операции (например, rb-1a2b3c4d5e6f7890)"),
});

export async function handleRollbackWrite(
  params: z.infer<typeof rollbackWriteSchema>,
): Promise<string> {
  const rb = takeRollback(params.token);
  if (!rb) {
    throw new Error(
      `Unknown, expired or already-used rollback token: ${params.token}. ` +
        "Tokens are one-shot and live in server memory only — after a restart, replay the " +
        "`inverse` operation recorded in the audit ledger (ONEC_AUDIT_LOG) manually.",
    );
  }
  // ponytail: the rollback itself is not re-gated — it is the undo of an
  // operation that already passed the gate, and re-gating would strand the
  // operator mid-incident. It is still fully logged.
  appendAudit({ event: "rollback_attempt", token: rb.token, inverse: rb.inverse });
  const result = await oneCRawWrite(rb.inverse.method, rb.inverse.path, rb.inverse.body);
  appendAudit({ event: "rollback_executed", token: rb.token });
  return JSON.stringify({ rolled_back: rb.describes, result: result ?? null }, null, 2);
}
