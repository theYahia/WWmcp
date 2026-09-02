/**
 * Write-safety layer: preview (dry-run) → approval gate → audit ledger → rollback token.
 *
 * Every write in this server goes through exactly three functions in client.ts
 * (`oneCPost` / `oneCPatch` / `oneCDelete`), so the whole layer is one guard
 * placed there — no per-tool changes, nothing to forget when a tool is added.
 *
 * Configuration (all opt-in; default = pre-4.0 behaviour, byte-identical):
 *   ONEC_WRITE_MODE      off (default) | deny | preview | approval
 *                        deny     — the 12 write tools are not registered at
 *                                   all: the model never sees them. Read-only
 *                                   engagements (сверка чужой базы) run here.
 *                        preview  — writes NEVER execute; every write tool
 *                                   returns a dry-run report instead.
 *                        approval — first call returns the dry-run report +
 *                                   `op_hash`; the write executes only after
 *                                   `approve_write(op_hash)` and a re-run of
 *                                   the identical tool call.
 *   ONEC_AUDIT_LOG       path to an append-only JSONL ledger (any mode).
 *                        Fail-closed: if the line cannot be appended, the write
 *                        is aborted.
 *   ONEC_AUDIT_ACTOR     "who" recorded in the ledger (default: ONEC_LOGIN).
 *   ONEC_APPROVAL_TTL_SEC  approval lifetime, default 300.
 *
 * Honest limitation: `approve_write` is itself an MCP tool call, so the human
 * gate is the MCP client's own tool-call confirmation UI — this layer makes the
 * write impossible without a *separate, explicit* confirmation step showing the
 * exact operation hash, it cannot by itself prove a human pressed the button.
 */

import { createHash } from "node:crypto";
import { appendFileSync } from "node:fs";

export type WriteMode = "off" | "deny" | "preview" | "approval";

export interface WriteOp {
  method: "POST" | "PATCH" | "DELETE";
  path: string;
  body?: unknown;
}

export function getWriteMode(): WriteMode {
  const raw = (process.env["ONEC_WRITE_MODE"] ?? "off").trim().toLowerCase();
  return raw === "preview" || raw === "approval" || raw === "deny" ? raw : "off";
}

function approvalTtlSec(): number {
  const n = Number(process.env["ONEC_APPROVAL_TTL_SEC"]);
  return Number.isFinite(n) && n > 0 ? n : 300;
}

// ──────────────────────────────────────────────────────────────
// Operation hash — identifies one concrete write, so an approval
// cannot be reused for a *different* operation.
// ──────────────────────────────────────────────────────────────

/** Deterministic JSON: object keys sorted, so argument order never changes the hash. */
function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  const entries = Object.entries(v as Record<string, unknown>).sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  return `{${entries.map(([k, val]) => `${JSON.stringify(k)}:${canonical(val)}`).join(",")}}`;
}

export function opHash(op: WriteOp): string {
  return createHash("sha256")
    .update(`${op.method} ${op.path} ${canonical(op.body ?? null)}`)
    .digest("hex")
    .slice(0, 16);
}

// ──────────────────────────────────────────────────────────────
// OData path parsing — entity / Ref_Key / bound action
// ──────────────────────────────────────────────────────────────

interface ParsedPath {
  /** Entity segment exactly as it appears in the path (URL-encoded). */
  entityEnc: string;
  entity: string;
  refKey?: string;
  /** Bound action segment: Post / Unpost. */
  action?: string;
}

const PATH_RE =
  /^\/odata\/standard\.odata\/([^(?/]+)(?:\(guid'([0-9a-fA-F-]{36})'\))?(?:\/([A-Za-z]+))?/;

function parsePath(path: string): ParsedPath | null {
  const m = PATH_RE.exec(path);
  if (!m || !m[1]) return null;
  let entity = m[1];
  try {
    entity = decodeURIComponent(m[1]);
  } catch {
    /* keep raw segment if it is not valid percent-encoding */
  }
  const parsed: ParsedPath = { entityEnc: m[1], entity };
  if (m[2]) parsed.refKey = m[2];
  if (m[3]) parsed.action = m[3];
  return parsed;
}

/** Rebuild `/odata/standard.odata/Entity(guid'…')` from a parsed path. */
function keyedBase(p: ParsedPath): string {
  return `/odata/standard.odata/${p.entityEnc}${p.refKey ? `(guid'${p.refKey}')` : ""}`;
}

// ──────────────────────────────────────────────────────────────
// Audit ledger — append-only JSONL
// ──────────────────────────────────────────────────────────────

/**
 * Append one ledger line. No-op when ONEC_AUDIT_LOG is unset.
 * Throws if the line cannot be written — deliberately fail-closed: an audited
 * deployment must not silently lose entries.
 *
 * ponytail: request bodies are logged verbatim (an audit of writes without the
 * payload is useless) — the ledger is as sensitive as the 1C data itself.
 */
export function appendAudit(entry: Record<string, unknown>): void {
  const file = process.env["ONEC_AUDIT_LOG"];
  if (!file) return;
  const actor =
    process.env["ONEC_AUDIT_ACTOR"] ??
    process.env["ONEC_LOGIN"] ??
    process.env["1C_LOGIN"] ??
    "unknown";
  appendFileSync(
    file,
    JSON.stringify({ ts: new Date().toISOString(), actor, ...entry }) + "\n",
    "utf8",
  );
}

// ──────────────────────────────────────────────────────────────
// Approvals — one-shot, hash-bound, TTL'd, in-memory
// ──────────────────────────────────────────────────────────────

const approvals = new Map<string, { expires: number; reason?: string }>();

export function approveOp(hash: string, reason?: string): number {
  const ttl = approvalTtlSec();
  approvals.set(hash, { expires: Date.now() + ttl * 1000, ...(reason ? { reason } : {}) });
  appendAudit({ event: "approved", op_hash: hash, reason: reason ?? null, ttl_sec: ttl });
  return ttl;
}

function consumeApproval(hash: string): boolean {
  const a = approvals.get(hash);
  if (!a) return false;
  approvals.delete(hash);
  return a.expires > Date.now();
}

/** Drop all in-memory approvals, previews and rollback tokens (used by tests). */
export function resetWriteSafetyState(): void {
  approvals.clear();
  previews.clear();
  rollbacks.clear();
}

// ──────────────────────────────────────────────────────────────
// Rollback tokens
// ──────────────────────────────────────────────────────────────

export interface Rollback {
  token: string;
  inverse: WriteOp;
  describes: string;
}

/** ponytail: in-memory + capped; the ledger keeps the inverse op for manual replay after a restart. */
const rollbacks = new Map<string, Rollback>();
const ROLLBACK_MAX = 100;

function inverseOf(
  op: WriteOp,
  before?: Record<string, unknown>,
): { inverse: WriteOp; describes: string } | null {
  const p = parsePath(op.path);
  if (!p) return null;
  const base = keyedBase(p);

  if (op.method === "POST" && p.action === "Post") {
    return {
      inverse: { method: "POST", path: `${base}/Unpost?$format=json`, body: {} },
      describes: `unpost (отменить проведение) ${p.entity} ${p.refKey ?? ""}`.trim(),
    };
  }
  if (op.method === "POST" && p.action === "Unpost") {
    return {
      inverse: {
        method: "POST",
        path: `${base}/Post?$format=json&PostingModeOperational=false`,
        body: {},
      },
      describes: `post (провести, неоперативно) ${p.entity} ${p.refKey ?? ""}`.trim(),
    };
  }
  if (op.method === "PATCH" && before && Object.keys(before).length > 0) {
    return {
      inverse: { method: "PATCH", path: `${base}?$format=json`, body: before },
      describes: `restore previous ${Object.keys(before).join(", ")} on ${p.entity}`,
    };
  }
  // DeletionMark toggle is structurally invertible even without a read-back.
  const mark = (op.body as Record<string, unknown> | undefined)?.["DeletionMark"];
  if (op.method === "PATCH" && typeof mark === "boolean") {
    return {
      inverse: { method: "PATCH", path: `${base}?$format=json`, body: { DeletionMark: !mark } },
      describes: `set DeletionMark=${!mark} on ${p.entity}`,
    };
  }
  return null;
}

function irreversibleReason(op: WriteOp, p: ParsedPath | null, readError?: string): string {
  if (op.method === "DELETE") {
    return "Physical OData DELETE — 1C has no undo. Prefer set_deletion_mark (recoverable soft delete).";
  }
  if (op.method === "POST" && !p?.action) {
    return "Creates a new record — no automatic undo. To reverse: take Ref_Key from the result and call set_deletion_mark (or delete_document).";
  }
  if (op.method === "PATCH") {
    return readError
      ? `Previous field values could not be read (${readError}), so the pre-write state is unknown.`
      : "Previous field values are unknown — run in preview/approval mode so they are captured before the write.";
  }
  return "No automatic inverse is defined for this operation.";
}

function registerRollback(hash: string, op: WriteOp, before?: Record<string, unknown>): Rollback | null {
  const inv = inverseOf(op, before);
  if (!inv) return null;
  const rb: Rollback = { token: `rb-${hash}`, ...inv };
  if (rollbacks.size >= ROLLBACK_MAX) {
    const oldest = rollbacks.keys().next().value;
    if (oldest) rollbacks.delete(oldest);
  }
  rollbacks.set(rb.token, rb);
  appendAudit({
    event: "rollback_token_issued",
    op_hash: hash,
    token: rb.token,
    inverse: rb.inverse,
    describes: rb.describes,
  });
  return rb;
}

/** One-shot lookup — a rollback token is consumed by use. */
export function takeRollback(token: string): Rollback | undefined {
  const rb = rollbacks.get(token);
  if (rb) rollbacks.delete(token);
  return rb;
}

// ──────────────────────────────────────────────────────────────
// Preview (dry-run)
// ──────────────────────────────────────────────────────────────

export interface PreviewEnvelope {
  write_safety: "preview";
  mode: WriteMode;
  op_hash: string;
  operation: {
    method: string;
    entity: string | null;
    ref_key: string | null;
    action: string | null;
    path: string;
    body: unknown;
  };
  /** What the write would change — field-level diff when the current state is readable. */
  changes: Record<string, unknown>;
  reversible: boolean;
  rollback_plan: string | null;
  irreversible_reason?: string;
  next_step: string;
}

export interface ExecutedEnvelope {
  write_safety: "executed";
  op_hash: string;
  rollback: { token: string; tool: "rollback_write"; describes: string } | null;
  irreversible_reason?: string;
  result: unknown;
}

/** True for both the preview and executed envelopes produced by this layer. */
export function isSafetyEnvelope(x: unknown): x is PreviewEnvelope | ExecutedEnvelope {
  return (
    typeof x === "object" &&
    x !== null &&
    ((x as Record<string, unknown>)["write_safety"] === "preview" ||
      (x as Record<string, unknown>)["write_safety"] === "executed")
  );
}

/** Previews awaiting approval — keeps the captured pre-write state for the rollback token. */
const previews = new Map<string, { envelope: PreviewEnvelope; before?: Record<string, unknown> }>();

type ReadFn = (path: string) => Promise<unknown>;

/** Read the current record so a PATCH preview can show from → to. */
async function readCurrent(
  p: ParsedPath,
  read: ReadFn,
): Promise<{ current?: Record<string, unknown>; error?: string }> {
  try {
    const raw = (await read(`${keyedBase(p)}?$format=json`)) as Record<string, unknown>;
    const value = raw?.["value"];
    const rec = Array.isArray(value) ? (value[0] as Record<string, unknown>) : raw;
    return rec && typeof rec === "object" ? { current: rec } : { error: "empty response" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function buildPreview(
  op: WriteOp,
  hash: string,
  mode: WriteMode,
  read: ReadFn,
): Promise<{ envelope: PreviewEnvelope; before?: Record<string, unknown> }> {
  const p = parsePath(op.path);
  let changes: Record<string, unknown>;
  let before: Record<string, unknown> | undefined;
  let readError: string | undefined;

  if (op.method === "PATCH" && p) {
    const body = (op.body ?? {}) as Record<string, unknown>;
    const { current, error } = await readCurrent(p, read);
    readError = error;
    // Прежнее значение либо прочитано, либо неизвестно — третьего («считаем, что там
    // был null») быть не должно. Раньше отсутствующее поле превращалось в null: предпросмотр
    // показывал клиенту «было null», а токен отката этим же null затирал реальное значение.
    // Для константы поле ровно одно (Value), то есть откат стирал бы всю константу.
    const unread = current
      ? Object.keys(body).filter((k) => !(k in current))
      : Object.keys(body);
    if (unread.length > 0) {
      throw new Error(
        `Гейт записи (ONEC_WRITE_MODE=${mode}) отклонил операцию: прежнее значение ` +
          `${unread.join(", ")} у ${p.entity} прочитать не удалось` +
          (error ? ` (${error})` : " — поля нет в ответе 1С") +
          ". Без него предпросмотр «было → стало» и откат невозможны, а записывать null " +
          "вместо неизвестного прежнего значения недопустимо. Проверьте права роли 1С на " +
          "чтение этой сущности либо выполните изменение в режиме ONEC_WRITE_MODE=off и " +
          "откатывайте вручную.",
      );
    }
    before = {};
    const fields: Record<string, unknown> = {};
    for (const [k, to] of Object.entries(body)) {
      before[k] = current![k];
      fields[k] = { from: current![k], to };
    }
    changes = { kind: "update_fields", fields };
  } else if (op.method === "DELETE") {
    changes = { kind: "physical_delete", target: `${p?.entity ?? op.path} ${p?.refKey ?? ""}`.trim() };
  } else if (p?.action === "Post") {
    changes = { kind: "post_document", effect: "Posted → true; register movements (движения) are written" };
  } else if (p?.action === "Unpost") {
    changes = { kind: "unpost_document", effect: "Posted → false; register movements are removed" };
  } else {
    changes = { kind: "create_record", entity: p?.entity ?? null, fields: op.body };
  }

  const inv = inverseOf(op, before);
  const envelope: PreviewEnvelope = {
    write_safety: "preview",
    mode,
    op_hash: hash,
    operation: {
      method: op.method,
      entity: p?.entity ?? null,
      ref_key: p?.refKey ?? null,
      action: p?.action ?? null,
      path: op.path,
      body: op.body ?? null,
    },
    changes,
    reversible: inv !== null,
    rollback_plan: inv ? `rollback_write → ${inv.describes}` : null,
    ...(inv ? {} : { irreversible_reason: irreversibleReason(op, p, readError) }),
    next_step:
      mode === "approval"
        ? `Nothing was written. Show this to the operator; after an explicit human "yes" call approve_write(op_hash="${hash}") and then re-run this exact tool call with identical arguments.`
        : "Nothing was written. ONEC_WRITE_MODE=preview disables all writes — set ONEC_WRITE_MODE=approval (or off) to execute.",
  };
  return { envelope, ...(before ? { before } : {}) };
}

// ──────────────────────────────────────────────────────────────
// The guard itself
// ──────────────────────────────────────────────────────────────

/**
 * Wrap one write. In "off" mode the raw 1C response is returned unchanged
 * (identical to the pre-write-safety behaviour); the ledger still records it
 * when ONEC_AUDIT_LOG is set.
 */
export async function guardWrite(
  op: WriteOp,
  exec: () => Promise<unknown>,
  read: ReadFn,
): Promise<unknown> {
  const mode = getWriteMode();
  const hash = opHash(op);

  // deny: write tools are not registered, so this is unreachable through the
  // MCP surface — kept as the second rubbish barrier for any internal caller.
  if (mode === "deny") {
    appendAudit({ event: "denied", mode, method: op.method, path: op.path });
    throw new Error(
      "ONEC_WRITE_MODE=deny — сервер запущен в режиме только чтения, запись в 1С недоступна.",
    );
  }

  if (mode !== "off" && !consumeApproval(hash)) {
    const preview = await buildPreview(op, hash, mode, read);
    previews.set(hash, preview);
    appendAudit({
      event: "preview",
      op_hash: hash,
      mode,
      method: op.method,
      path: op.path,
      body: op.body ?? null,
    });
    return preview.envelope;
  }

  // Logged BEFORE the write: if the ledger is unwritable the write never happens.
  appendAudit({
    event: "attempt",
    op_hash: hash,
    mode,
    method: op.method,
    path: op.path,
    body: op.body ?? null,
  });

  let result: unknown;
  try {
    result = await exec();
  } catch (e) {
    appendAudit({
      event: "failed",
      op_hash: hash,
      error: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
  appendAudit({ event: "executed", op_hash: hash });

  if (mode === "off") return result;

  const before = previews.get(hash)?.before;
  previews.delete(hash);
  const rb = registerRollback(hash, op, before);
  const envelope: ExecutedEnvelope = {
    write_safety: "executed",
    op_hash: hash,
    rollback: rb ? { token: rb.token, tool: "rollback_write", describes: rb.describes } : null,
    ...(rb ? {} : { irreversible_reason: irreversibleReason(op, parsePath(op.path)) }),
    result: result ?? null,
  };
  return envelope;
}
