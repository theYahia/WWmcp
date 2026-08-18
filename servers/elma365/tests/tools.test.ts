import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleGetAppItems, handleGetAppItem, handleCreateItem,
  handleUpdateAppItem, handleSetAppItemStatus,
} from "../src/tools/app-items.js";
import {
  handleGetTasks, handleGetTask, handleGetTaskExits,
  handleCompleteTask, handleReassignTask,
} from "../src/tools/tasks.js";
import {
  handleListProcesses, handleGetProcessInstances, handleStartProcess,
} from "../src/tools/processes.js";
import { handleGetUsers, handleGetUserById } from "../src/tools/users.js";
import { handleGetComments, handleAddComment } from "../src/tools/comments.js";
import {
  handleListNamespaces, handleListApps, handleGetAppSchema,
} from "../src/tools/scheme.js";

/**
 * Контракт-тесты: для каждого инструмента проверяем МЕТОД, ПУТЬ и ТЕЛО запроса.
 * Именно этого не хватало раньше — старые тесты не ловили обращения к несуществующим эндпоинтам.
 */
describe("tools — contract (method + path + body)", () => {
  beforeEach(() => {
    process.env.ELMA365_DOMAIN = "testdomain";
    process.env.ELMA365_TOKEN = "test-token";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockFetch = (data: unknown) =>
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(data), { status: 200 }),
    );

  /** Достаёт [path-without-base, method, parsedBody] из единственного вызова fetch. */
  const callOf = (spy: ReturnType<typeof mockFetch>) => {
    const [url, opts] = spy.mock.calls[0] as [string, RequestInit];
    const path = String(url).replace("https://testdomain.elma365.ru/pub/v1/", "");
    const body = opts?.body ? JSON.parse(String(opts.body)) : undefined;
    return { path, method: opts?.method, body };
  };

  // --- App items ---
  describe("app-items", () => {
    it("get_app_items → POST app/{ns}/{code}/list with paging body", async () => {
      const spy = mockFetch({ result: { result: [{ __id: "1" }], total: 1 } });
      await handleGetAppItems({ namespace: "deals", code: "crm", from: 0, size: 50, active: true });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("app/deals/crm/list");
      expect(body).toMatchObject({ from: 0, size: 50, active: true });
    });

    it("get_app_item → GET app/{ns}/{code}/{id}/get", async () => {
      const spy = mockFetch({ __id: "i1" });
      await handleGetAppItem({ namespace: "deals", code: "crm", id: "i1" });
      const { path, method } = callOf(spy);
      expect(method).toBe("GET");
      expect(path).toBe("app/deals/crm/i1/get");
    });

    it("create_item → POST .../create wrapping fields in context", async () => {
      const spy = mockFetch({ success: true, item: { __id: "new" } });
      await handleCreateItem({ namespace: "hr", code: "candidates", data: { name: "John" } });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("app/hr/candidates/create");
      // Критично: поля внутри context, не на верхнем уровне.
      expect(body).toEqual({ context: { name: "John" } });
      expect(body.name).toBeUndefined();
    });

    it("create_item passes optional statusGroupId / withEventForceCreate as siblings of context", async () => {
      const spy = mockFetch({ success: true });
      await handleCreateItem({ namespace: "hr", code: "c", data: { a: 1 }, statusGroupId: "s1", withEventForceCreate: true });
      const { body } = callOf(spy);
      expect(body).toEqual({ context: { a: 1 }, statusGroupId: "s1", withEventForceCreate: true });
    });

    it("update_app_item → POST .../{id}/update wrapping fields in context", async () => {
      const spy = mockFetch({ success: true });
      await handleUpdateAppItem({ namespace: "deals", code: "crm", id: "i1", data: { stage: "won" } });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("app/deals/crm/i1/update");
      expect(body).toEqual({ context: { stage: "won" } });
    });

    it("set_app_item_status → POST .../{id}/set-status", async () => {
      const spy = mockFetch({ success: true });
      await handleSetAppItemStatus({ namespace: "deals", code: "crm", id: "i1", status: "closed" });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("app/deals/crm/i1/set-status");
      expect(body).toEqual({ status: "closed" });
    });
  });

  // --- Tasks ---
  describe("tasks", () => {
    it("get_tasks → POST tasks/list (NOT bpm/task)", async () => {
      const spy = mockFetch({ result: { result: [{ id: "t1" }], total: 1 } });
      await handleGetTasks({ from: 0, size: 50, kind: "all" });
      const { path, method } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("tasks/list");
      expect(path).not.toContain("bpm/task");
    });

    it("get_tasks kind=income → POST tasks/list/income", async () => {
      const spy = mockFetch({ result: { result: [] } });
      await handleGetTasks({ from: 0, size: 50, kind: "income" });
      expect(callOf(spy).path).toBe("tasks/list/income");
    });

    it("get_task → GET tasks/{id}/get", async () => {
      const spy = mockFetch({ id: "t1" });
      await handleGetTask({ id: "t1" });
      const { path, method } = callOf(spy);
      expect(method).toBe("GET");
      expect(path).toBe("tasks/t1/get");
    });

    it("get_task_exits → GET tasks/{id}/exits", async () => {
      const spy = mockFetch([{ id: "e1", name: "Согласовать" }]);
      await handleGetTaskExits({ id: "t1" });
      expect(callOf(spy).path).toBe("tasks/t1/exits");
    });

    it("complete_task → PUT tasks/{id}/submit with exitId + instanceId", async () => {
      const spy = mockFetch({ success: true });
      await handleCompleteTask({ id: "t1", exitId: "e1", instanceId: "inst1", context: { comment: "ok" } });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("PUT");
      expect(path).toBe("tasks/t1/submit");
      expect(body).toEqual({ exitId: "e1", instanceId: "inst1", context: { comment: "ok" } });
    });

    it("reassign_task → POST tasks/{id}/reassign", async () => {
      const spy = mockFetch({ success: true });
      await handleReassignTask({ id: "t1", userId: "u2" });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("tasks/t1/reassign");
      expect(body).toEqual({ userId: "u2" });
    });
  });

  // --- Processes ---
  describe("processes", () => {
    it("list_processes → GET scheme/namespaces/{ns}/processes (NOT bpm/process)", async () => {
      const spy = mockFetch([{ code: "approval" }]);
      await handleListProcesses({ namespace: "sales" });
      const { path, method } = callOf(spy);
      expect(method).toBe("GET");
      expect(path).toBe("scheme/namespaces/sales/processes");
      expect(path).not.toContain("bpm/process");
    });

    it("get_process_instances → POST bpm/instance/bytemplate/{ns}/{code}/list", async () => {
      const spy = mockFetch({ result: { result: [] } });
      await handleGetProcessInstances({ namespace: "sales", code: "approval", from: 0, size: 50 });
      const { path, method } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("bpm/instance/bytemplate/sales/approval/list");
    });

    it("start_process → POST bpm/template/{ns}/{code}/run (NOT bpm/process/{code}/start)", async () => {
      const spy = mockFetch({ id: "inst-1", status: "started" });
      await handleStartProcess({ namespace: "sales", code: "approval", context: { amount: 5000 } });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("bpm/template/sales/approval/run");
      expect(path).not.toContain("/start");
      expect(body).toEqual({ context: { amount: 5000 } });
    });
  });

  // --- Users ---
  describe("users", () => {
    it("get_users → POST user/list", async () => {
      const spy = mockFetch({ result: { result: [{ __id: "u1", __name: "Ivan" }] } });
      await handleGetUsers({ from: 0, size: 50 });
      const { path, method } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("user/list");
    });

    it("get_user_by_id → POST user/list with ids filter (NOT user/{id})", async () => {
      const spy = mockFetch({ result: { result: [{ __id: "u1", email: "ivan@test.ru" }] } });
      const out = await handleGetUserById({ id: "u1" });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("user/list");
      expect(path).not.toBe("user/u1");
      expect(body).toMatchObject({ ids: ["u1"] });
      // Возвращает первого пользователя из конверта.
      expect(JSON.parse(out).email).toBe("ivan@test.ru");
    });
  });

  // --- Comments (feed) ---
  describe("comments (object feed)", () => {
    it("get_comments → POST feed/{ns}/{code}/{itemId}/message/list (NOT app/.../comment)", async () => {
      const spy = mockFetch({ result: { result: [{ __id: "m1", body: "Hello" }] } });
      await handleGetComments({ namespace: "deals", code: "crm", itemId: "item-1", from: 0, size: 50 });
      const { path, method } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("feed/deals/crm/item-1/message/list");
      expect(path).not.toContain("/comment");
    });

    it("add_comment → POST feed/{ns}/{code}/{itemId}/message with body field", async () => {
      const spy = mockFetch({ __id: "m2" });
      await handleAddComment({ namespace: "hr", code: "emp", itemId: "e1", text: "Note" });
      const { path, method, body } = callOf(spy);
      expect(method).toBe("POST");
      expect(path).toBe("feed/hr/emp/e1/message");
      expect(body).toEqual({ body: "Note" });
    });
  });

  // --- Discovery (scheme) ---
  describe("scheme discovery", () => {
    it("list_namespaces → GET scheme/namespaces", async () => {
      const spy = mockFetch([{ code: "sales" }]);
      await handleListNamespaces({});
      const { path, method } = callOf(spy);
      expect(method).toBe("GET");
      expect(path).toBe("scheme/namespaces");
    });

    it("list_apps → GET scheme/namespaces/{ns}/apps", async () => {
      const spy = mockFetch([{ code: "crm" }]);
      await handleListApps({ namespace: "sales" });
      expect(callOf(spy).path).toBe("scheme/namespaces/sales/apps");
    });

    it("get_app_schema → GET scheme/namespaces/{ns}/apps/{code}", async () => {
      const spy = mockFetch({ fields: [] });
      await handleGetAppSchema({ namespace: "sales", code: "crm" });
      expect(callOf(spy).path).toBe("scheme/namespaces/sales/apps/crm");
    });
  });
});
