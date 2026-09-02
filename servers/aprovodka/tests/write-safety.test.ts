import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { oneCPost, oneCPatch, oneCDelete, resetClient, buildKeyedPath } from "../src/client.js";
import {
  opHash,
  getWriteMode,
  resetWriteSafetyState,
  isSafetyEnvelope,
  previewCount,
  PREVIEW_MAX,
} from "../src/lib/write-safety.js";
import {
  handleApproveWrite,
  handleRollbackWrite,
} from "../src/tools/safety.js";
import { handlePostDocument, handleDeleteDocument } from "../src/tools/documents.js";
import { handleUpdateCatalogItem } from "../src/tools/catalogs.js";
import { handleSetConstant } from "../src/tools/constants.js";
import { countRegisteredTools, getEnabledModules } from "../src/server.js";

const GUID = "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f";

function mockFetch(...responses: unknown[]) {
  const fn = vi.fn();
  for (const data of responses) {
    fn.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify(data)),
      headers: new Map(),
    });
  }
  fn.mockResolvedValue({
    ok: true,
    text: () => Promise.resolve(JSON.stringify({})),
    headers: new Map(),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("write-safety", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    delete process.env["ONEC_WRITE_MODE"];
    delete process.env["ONEC_AUDIT_LOG"];
    resetClient();
    resetWriteSafetyState();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
    resetWriteSafetyState();
  });

  // ── op hash ──

  it("opHash is stable and independent of body key order", () => {
    const a = opHash({ method: "POST", path: "/p", body: { b: 2, a: 1 } });
    const b = opHash({ method: "POST", path: "/p", body: { a: 1, b: 2 } });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });

  it("opHash differs when the payload differs", () => {
    const a = opHash({ method: "PATCH", path: "/p", body: { Цена: 100 } });
    const b = opHash({ method: "PATCH", path: "/p", body: { Цена: 999 } });
    expect(a).not.toBe(b);
  });

  // ── default mode: unchanged behaviour ──

  it("default mode is off and writes execute raw (no envelope)", async () => {
    expect(getWriteMode()).toBe("off");
    const fetchMock = mockFetch({ Ref_Key: "abc-123" });
    const result = await oneCPost("/odata/standard.odata/Document_Test", { Number: "001" });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result).toEqual({ Ref_Key: "abc-123" });
    expect(isSafetyEnvelope(result)).toBe(false);
  });

  it("safety tools are not counted while the gate is off", () => {
    delete process.env["ONEC_SERVICES"];
    expect(countRegisteredTools(getEnabledModules())).toBe(34);
    process.env["ONEC_WRITE_MODE"] = "approval";
    expect(countRegisteredTools(getEnabledModules())).toBe(36);
  });

  // ── preview mode ──

  it("preview mode returns a dry-run report and performs no write", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    const fetchMock = mockFetch();
    const path = buildKeyedPath("Document_Test", GUID, "Post", { $format: "json" });
    const res = (await oneCPost(path, {})) as Record<string, any>;

    expect(fetchMock).not.toHaveBeenCalled();
    expect(res["write_safety"]).toBe("preview");
    expect(res["operation"].entity).toBe("Document_Test");
    expect(res["operation"].ref_key).toBe(GUID);
    expect(res["changes"].kind).toBe("post_document");
    expect(res["reversible"]).toBe(true);
    expect(res["rollback_plan"]).toContain("unpost");
  });

  it("preview of a PATCH reads current values and shows from → to", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    const fetchMock = mockFetch({ Ref_Key: GUID, Description: "Молоко" });
    const path = buildKeyedPath("Catalog_Номенклатура", GUID, undefined, { $format: "json" });
    const res = (await oneCPatch(path, { Description: "Кефир" })) as Record<string, any>;

    // one GET for the current state, zero writes
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    expect(res["changes"].fields.Description).toEqual({ from: "Молоко", to: "Кефир" });
    expect(res["reversible"]).toBe(true);
  });

  it("preview marks physical delete as irreversible", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    mockFetch();
    const out = JSON.parse(
      await handleDeleteDocument({ document_type: "Document_Test", ref_key: GUID }),
    );
    expect(out.write_safety).toBe("preview");
    expect(out.reversible).toBe(false);
    expect(out.irreversible_reason).toMatch(/no undo/i);
    expect(out.deleted).toBeUndefined();
  });

  it("preview mode refuses approvals (writes are disabled outright)", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    await expect(handleApproveWrite({ op_hash: "0123456789abcdef" })).rejects.toThrow(
      /requires ONEC_WRITE_MODE=approval/,
    );
  });

  // ── approval gate ──

  it("approval gate: preview → approve → identical re-run executes once", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch();

    const first = JSON.parse(
      await handlePostDocument({ document_type: "Document_Test", ref_key: GUID, operational: false }),
    );
    expect(first.write_safety).toBe("preview");

    const approved = JSON.parse(await handleApproveWrite({ op_hash: first.op_hash, reason: "оператор подтвердил" }));
    expect(approved.approved).toBe(first.op_hash);

    const fetchMock = mockFetch({ Posted: true });
    const second = JSON.parse(
      await handlePostDocument({ document_type: "Document_Test", ref_key: GUID, operational: false }),
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][1].method).toBe("POST");
    expect(second.write_safety).toBe("executed");
    expect(second.result).toEqual({ Posted: true });
    expect(second.rollback.token).toBe(`rb-${first.op_hash}`);
    expect(second.rollback.tool).toBe("rollback_write");

    // approval is single-use: the third call previews again
    const third = JSON.parse(
      await handlePostDocument({ document_type: "Document_Test", ref_key: GUID, operational: false }),
    );
    expect(third.write_safety).toBe("preview");
  });

  it("an approval does not unlock a different operation", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch({ Ref_Key: GUID, Цена: 100 });
    const path = buildKeyedPath("Catalog_Номенклатура", GUID, undefined, { $format: "json" });
    const preview = (await oneCPatch(path, { Цена: 150 })) as Record<string, any>;
    await handleApproveWrite({ op_hash: preview["op_hash"] });

    // same target, different value → different hash → still a preview
    const fetchMock = mockFetch({ Ref_Key: GUID, Цена: 100 });
    const other = (await oneCPatch(path, { Цена: 999 })) as Record<string, any>;
    expect(other["write_safety"]).toBe("preview");
    expect(fetchMock.mock.calls.every((c: any[]) => c[1].method === "GET")).toBe(true);
  });

  it("an expired approval does not execute the write", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    process.env["ONEC_APPROVAL_TTL_SEC"] = "1";
    mockFetch();
    const path = buildKeyedPath("Document_Test", GUID, "Unpost", { $format: "json" });
    const preview = (await oneCPost(path, {})) as Record<string, any>;
    await handleApproveWrite({ op_hash: preview["op_hash"] });

    vi.setSystemTime(Date.now() + 5_000);
    const fetchMock = mockFetch();
    const again = (await oneCPost(path, {})) as Record<string, any>;
    vi.useRealTimers();
    expect(again["write_safety"]).toBe("preview");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  // ── rollback ──

  it("rollback_write executes the inverse of a posted document", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch();
    const postPath = buildKeyedPath("Document_Test", GUID, "Post", { $format: "json" });
    const preview = (await oneCPost(postPath, {})) as Record<string, any>;
    await handleApproveWrite({ op_hash: preview["op_hash"] });
    mockFetch({ ok: true });
    const executed = (await oneCPost(postPath, {})) as Record<string, any>;

    const fetchMock = mockFetch({ Posted: false });
    const out = JSON.parse(await handleRollbackWrite({ token: executed["rollback"].token }));
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain("/Unpost");
    expect(out.rolled_back).toContain("unpost");

    // one-shot
    await expect(handleRollbackWrite({ token: executed["rollback"].token })).rejects.toThrow(
      /already-used rollback token/,
    );
  });

  it("rollback of a field update restores the previous values", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch({ Ref_Key: GUID, Description: "Молоко" });
    const path = buildKeyedPath("Catalog_Номенклатура", GUID, undefined, { $format: "json" });
    const preview = (await oneCPatch(path, { Description: "Кефир" })) as Record<string, any>;
    await handleApproveWrite({ op_hash: preview["op_hash"] });
    mockFetch({ Ref_Key: GUID, Description: "Кефир" });
    const executed = (await oneCPatch(path, { Description: "Кефир" })) as Record<string, any>;

    const fetchMock = mockFetch({ Ref_Key: GUID, Description: "Молоко" });
    await handleRollbackWrite({ token: executed["rollback"].token });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body)).toEqual({ Description: "Молоко" });
  });

  it("create has no rollback token and says why", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch();
    const path = "/odata/standard.odata/Catalog_%D0%9D%D0%BE%D0%BC?$format=json";
    const preview = (await oneCPost(path, { Description: "Новый" })) as Record<string, any>;
    expect(preview["reversible"]).toBe(false);
    await handleApproveWrite({ op_hash: preview["op_hash"] });
    mockFetch({ Ref_Key: "new-guid" });
    const executed = (await oneCPost(path, { Description: "Новый" })) as Record<string, any>;
    expect(executed["rollback"]).toBeNull();
    expect(executed["irreversible_reason"]).toMatch(/set_deletion_mark/);
  });

  // ── константы: единственное поле Value, поэтому «неизвестное прежнее значение»
  //    здесь означало бы откат, стирающий всю константу ──

  it("set_constant preview shows the real previous Value, not null", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    // 1С отдаёт константу как одиночную запись
    const fetchMock = mockFetch({ Value: "RUB" });
    const preview = JSON.parse(
      await handleSetConstant({ constant_name: "ОсновнаяВалюта", value: "USD" }),
    );
    expect(fetchMock).toHaveBeenCalledOnce(); // только чтение, записи нет
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
    expect(preview.changes.fields.Value).toEqual({ from: "RUB", to: "USD" });
    expect(preview.reversible).toBe(true);
  });

  it("set_constant preview reads the collection envelope form too", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    mockFetch({ value: [{ Value: "RUB" }] });
    const preview = JSON.parse(
      await handleSetConstant({ constant_name: "Constant_ОсновнаяВалюта", value: "USD" }),
    );
    expect(preview.changes.fields.Value).toEqual({ from: "RUB", to: "USD" });
  });

  it("set_constant in approval mode rolls back to the real previous Value", async () => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    mockFetch({ Value: "RUB" });
    const preview = JSON.parse(
      await handleSetConstant({ constant_name: "ОсновнаяВалюта", value: "USD" }),
    );
    expect(preview.changes.fields.Value.from).toBe("RUB");
    await handleApproveWrite({ op_hash: preview.op_hash });

    mockFetch({ Value: "USD" });
    const executed = JSON.parse(
      await handleSetConstant({ constant_name: "ОсновнаяВалюта", value: "USD" }),
    );
    expect(executed.write_safety).toBe("executed");

    const fetchMock = mockFetch({ Value: "RUB" });
    await handleRollbackWrite({ token: executed.rollback.token });
    const [, opts] = fetchMock.mock.calls[0];
    expect(opts.method).toBe("PATCH");
    expect(JSON.parse(opts.body)).toEqual({ Value: "RUB" }); // не null
  });

  it.each([
    ["ответ без поля Value", { SomethingElse: 1 }],
    ["пустой конверт", { value: [] }],
    ["значение скаляром в value", { value: "RUB" }],
  ])("set_constant is refused when the previous value is unreadable (%s)", async (_name, resp) => {
    process.env["ONEC_WRITE_MODE"] = "approval";
    const fetchMock = mockFetch(resp);
    await expect(
      handleSetConstant({ constant_name: "ОсновнаяВалюта", value: "USD" }),
    ).rejects.toThrow(/прежнее значение|отклонил операцию/);
    // прочитали и остановились: PATCH не ушёл
    expect(fetchMock.mock.calls.every((c: any[]) => c[1].method === "GET")).toBe(true);
  });

  it("a PATCH whose current state cannot be read is refused, no rollback token", async () => {
    process.env["ONEC_WRITE_MODE"] = "preview";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      text: () => Promise.resolve("Недостаточно прав"),
      headers: new Map(),
    });
    vi.stubGlobal("fetch", fetchMock);
    const path = buildKeyedPath("Catalog_Номенклатура", GUID, undefined, { $format: "json" });
    await expect(oneCPatch(path, { Description: "Кефир" })).rejects.toThrow(/отклонил операцию/);
    expect(fetchMock.mock.calls.every((c: any[]) => c[1].method === "GET")).toBe(true);
  });

  it("rejects an unknown rollback token", async () => {
    await expect(handleRollbackWrite({ token: "rb-deadbeefdeadbeef" })).rejects.toThrow(/Unknown/);
  });

  // ── audit ledger ──

  it("audit ledger records preview, approval, attempt and execution as JSONL", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aprovodka-audit-"));
    const ledger = join(dir, "audit.jsonl");
    process.env["ONEC_WRITE_MODE"] = "approval";
    process.env["ONEC_AUDIT_LOG"] = ledger;
    process.env["ONEC_AUDIT_ACTOR"] = "buh@example.com";

    mockFetch();
    const path = buildKeyedPath("Document_Test", GUID, "Post", { $format: "json" });
    const preview = (await oneCPost(path, {})) as Record<string, any>;
    await handleApproveWrite({ op_hash: preview["op_hash"], reason: "закрытие месяца" });
    mockFetch({ Posted: true });
    await oneCPost(path, {});

    const events = readFileSync(ledger, "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(events.map((e) => e.event)).toEqual([
      "preview",
      "approved",
      "attempt",
      "executed",
      "rollback_token_issued",
    ]);
    expect(events.every((e) => e.actor === "buh@example.com" && typeof e.ts === "string")).toBe(true);
    expect(events[0].op_hash).toBe(preview["op_hash"]);
    expect(events[1].reason).toBe("закрытие месяца");
  });

  it("audit ledger records writes in off mode too, and a failure as `failed`", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aprovodka-audit-"));
    const ledger = join(dir, "audit.jsonl");
    process.env["ONEC_AUDIT_LOG"] = ledger;

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: () => Promise.resolve("Объект не найден"),
        headers: new Map(),
      }),
    );
    await expect(oneCPatch("/odata/standard.odata/Catalog_Test", { X: 1 })).rejects.toThrow();

    const events = readFileSync(ledger, "utf8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(events.map((e) => e.event)).toEqual(["attempt", "failed"]);
    expect(events[0].actor).toBe("admin"); // falls back to ONEC_LOGIN
    expect(events[0].body).toEqual({ X: 1 });
  });

  it("fail-closed: an unwritable ledger aborts the write", async () => {
    const missingDir = join(tmpdir(), "aprovodka-nope-" + Date.now(), "audit.jsonl");
    expect(existsSync(missingDir)).toBe(false);
    process.env["ONEC_AUDIT_LOG"] = missingDir;
    const fetchMock = mockFetch();
    await expect(oneCDelete("/odata/standard.odata/Document_Test")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

/**
 * normaliseEntity сделал инструменты толерантными к префиксу. Путь входит в
 * op_hash, значит одобрение, выданное на "Номенклатура", теперь примет и
 * "Catalog_Номенклатура". Это правильно — гейт привязывает одобрение к ЭФФЕКТУ,
 * а не к написанию, — но выглядит как обход, поэтому зафиксировано тестом.
 * До normaliseEntity голая форма просто давала 404, так что одобрения на неё
 * не существовало вовсе: поведение сузило неожиданность, а не расширило.
 */
describe("write gate is bound to the effect, not the spelling", () => {
  const originalEnv = { ...process.env };
  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://1c.test/base";
    process.env["ONEC_LOGIN"] = "u";
    process.env["ONEC_PASSWORD"] = "p";
    process.env["ONEC_WRITE_MODE"] = "preview";
    resetClient();
  });
  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("bare and prefixed catalog_name yield the same op_hash", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ Ref_Key: "x", Code: "0" })),
        headers: new Map(),
      }),
    );
    const ref = "5c8d9e2f-1a2b-3c4d-5e6f-7a8b9c0d1e2f";
    const bare = JSON.parse(
      await handleUpdateCatalogItem({ catalog_name: "Номенклатура", ref_key: ref, data: { Code: "1" } }),
    );
    const full = JSON.parse(
      await handleUpdateCatalogItem({ catalog_name: "Catalog_Номенклатура", ref_key: ref, data: { Code: "1" } }),
    );
    expect(bare.op_hash).toBeDefined();
    expect(bare.op_hash).toBe(full.op_hash);
  });
});

/**
 * В режиме `preview` записи не выполняются никогда, а очистка карты предпросмотров
 * стояла только в ветке фактического выполнения — то есть самый безопасный режим
 * тёк линейно по числу операций (WORK-1531).
 */
describe("карта предпросмотров не растёт бесконечно", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env["ONEC_BASE_URL"] = "http://localhost:8080/base";
    process.env["ONEC_LOGIN"] = "admin";
    process.env["ONEC_PASSWORD"] = "secret";
    process.env["ONEC_WRITE_MODE"] = "preview";
    delete process.env["ONEC_AUDIT_LOG"];
    resetClient();
    resetWriteSafetyState();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    resetClient();
    resetWriteSafetyState();
  });

  /** 150 разных операций проведения — каждая даёт свой op_hash. */
  async function previewMany(n: number): Promise<string[]> {
    mockFetch();
    const hashes: string[] = [];
    for (let i = 0; i < n; i++) {
      const guid = `5c8d9e2f-1a2b-3c4d-5e6f-${String(i).padStart(12, "0")}`;
      const r = JSON.parse(
        await handlePostDocument({ document_type: "Document_Test", ref_key: guid, operational: false }),
      );
      expect(r.write_safety).toBe("preview");
      hashes.push(r.op_hash);
    }
    return hashes;
  }

  it("150 предпросмотров подряд — не больше 100 в памяти, самый свежий на месте", async () => {
    const hashes = await previewMany(150);

    expect(previewCount()).toBeLessThanOrEqual(PREVIEW_MAX);
    expect(previewCount()).toBe(PREVIEW_MAX);

    // Самый свежий пережил вытеснение: одобрение по нему проходит.
    process.env["ONEC_WRITE_MODE"] = "approval";
    const newest = hashes[hashes.length - 1]!;
    const approved = JSON.parse(await handleApproveWrite({ op_hash: newest }));
    expect(approved.approved).toBe(newest);
  });

  it("одобрение по хэшу вытесненного превью — понятная ошибка, а не молчаливый сбой", async () => {
    const hashes = await previewMany(150);
    const evicted = hashes[0]!;

    process.env["ONEC_WRITE_MODE"] = "approval";
    await expect(handleApproveWrite({ op_hash: evicted })).rejects.toThrow(
      /предпросмотра операции op_hash=/,
    );
    await expect(handleApproveWrite({ op_hash: evicted })).rejects.toThrow(/токена отката/);
  });
});
