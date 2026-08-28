import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  planfixPost: vi.fn(),
  planfixGet: vi.fn(),
}));

import { planfixPost, planfixGet } from "../src/client.js";

const mockPost = vi.mocked(planfixPost);
const mockGet = vi.mocked(planfixGet);

describe("tasks tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleGetTasks calls task/list with defaults + fields", async () => {
    mockPost.mockResolvedValue({ tasks: [] });
    const { handleGetTasks } = await import("../src/tools/tasks.js");
    await handleGetTasks({});
    expect(mockPost).toHaveBeenCalledWith(
      "task/list",
      expect.objectContaining({ offset: 0, pageSize: 100, fields: expect.stringContaining("name") }),
    );
  });

  it("handleGetTasks coerces filterId to string", async () => {
    mockPost.mockResolvedValue({ tasks: [{ id: 1 }] });
    const { handleGetTasks } = await import("../src/tools/tasks.js");
    await handleGetTasks({ filterId: 42 });
    expect(mockPost).toHaveBeenCalledWith("task/list", expect.objectContaining({ filterId: "42" }));
  });

  it("handleGetTask calls GET task/:id with fields query", async () => {
    mockGet.mockResolvedValue({ task: { id: 5, name: "Test" } });
    const { handleGetTask } = await import("../src/tools/tasks.js");
    const result = await handleGetTask({ taskId: 5 });
    expect(mockGet).toHaveBeenCalledWith("task/5", expect.objectContaining({ fields: expect.any(String) }));
    expect(result).toContain("#5");
  });

  it("handleCreateTask sends PeopleRequest assignees shape", async () => {
    mockPost.mockResolvedValue({ result: "success", id: 10 });
    const { handleCreateTask } = await import("../src/tools/tasks.js");
    const result = await handleCreateTask({ name: "New task", projectId: 3, assigneeId: 7 });
    expect(mockPost).toHaveBeenCalledWith("task/", {
      name: "New task",
      project: { id: 3 },
      assignees: { users: [{ id: "user:7" }] },
    });
    expect(result).toContain("ID: 10");
  });

  it("handleUpdateTask sends status object and ack", async () => {
    mockPost.mockResolvedValue({});
    const { handleUpdateTask } = await import("../src/tools/tasks.js");
    const result = await handleUpdateTask({ taskId: 10, name: "Updated", status: 2 });
    expect(mockPost).toHaveBeenCalledWith("task/10", {
      name: "Updated",
      status: { id: 2 },
    });
    expect(result).toContain("#10");
  });

  it("handleUpdateTask fixes assignees shape", async () => {
    mockPost.mockResolvedValue({});
    const { handleUpdateTask } = await import("../src/tools/tasks.js");
    await handleUpdateTask({ taskId: 11, assigneeId: 99 });
    expect(mockPost).toHaveBeenCalledWith("task/11", {
      assignees: { users: [{ id: "user:99" }] },
    });
  });
});

describe("contacts tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleGetContacts calls contact/list with fields", async () => {
    mockPost.mockResolvedValue({ contacts: [] });
    const { handleGetContacts } = await import("../src/tools/contacts.js");
    await handleGetContacts({});
    expect(mockPost).toHaveBeenCalledWith(
      "contact/list",
      expect.objectContaining({ offset: 0, pageSize: 100, fields: expect.any(String) }),
    );
  });

  it("handleGetContact calls GET contact/:id with fields", async () => {
    mockGet.mockResolvedValue({ contact: { id: 3, name: "John" } });
    const { handleGetContact } = await import("../src/tools/contacts.js");
    const result = await handleGetContact({ contactId: 3 });
    expect(mockGet).toHaveBeenCalledWith("contact/3", expect.objectContaining({ fields: expect.any(String) }));
    expect(result).toContain("John");
  });

  it("handleCreateContact posts to contact/ with phones array", async () => {
    mockPost.mockResolvedValue({ result: "success", id: 50 });
    const { handleCreateContact } = await import("../src/tools/contacts.js");
    const result = await handleCreateContact({ name: "Acme", email: "a@b.c", phone: "+79991234567" });
    expect(mockPost).toHaveBeenCalledWith("contact/", {
      name: "Acme",
      email: "a@b.c",
      phones: [{ number: "+79991234567" }],
    });
    expect(result).toContain("ID: 50");
  });

  it("handleUpdateContact posts to contact/:id", async () => {
    mockPost.mockResolvedValue({});
    const { handleUpdateContact } = await import("../src/tools/contacts.js");
    const result = await handleUpdateContact({ contactId: 5, name: "Renamed" });
    expect(mockPost).toHaveBeenCalledWith("contact/5", { name: "Renamed" });
    expect(result).toContain("#5");
  });
});

describe("projects tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleGetProjects calls project/list with fields and no filterId", async () => {
    mockPost.mockResolvedValue({ projects: [] });
    const { handleGetProjects } = await import("../src/tools/projects.js");
    await handleGetProjects({});
    const body = mockPost.mock.calls[0][1] as Record<string, unknown>;
    expect(mockPost).toHaveBeenCalledWith("project/list", expect.objectContaining({ offset: 0, pageSize: 100, fields: expect.any(String) }));
    expect(body).not.toHaveProperty("filterId");
  });

  it("handleGetProject calls GET project/:id with fields", async () => {
    mockGet.mockResolvedValue({ project: { id: 1, name: "Proj" } });
    const { handleGetProject } = await import("../src/tools/projects.js");
    const result = await handleGetProject({ projectId: 1 });
    expect(mockGet).toHaveBeenCalledWith("project/1", expect.objectContaining({ fields: expect.any(String) }));
    expect(result).toContain("Proj");
  });
});

describe("comments tools (plural path regression)", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleGetComments calls task/:id/comments/list (plural)", async () => {
    mockPost.mockResolvedValue({ comments: [] });
    const { handleGetComments } = await import("../src/tools/comments.js");
    await handleGetComments({ taskId: 5 });
    expect(mockPost).toHaveBeenCalledWith(
      "task/5/comments/list",
      expect.objectContaining({ offset: 0, pageSize: 100 }),
    );
  });

  it("handleAddComment posts to task/:id/comments/ (plural) with description", async () => {
    mockPost.mockResolvedValue({ result: "success", id: 99 });
    const { handleAddComment } = await import("../src/tools/comments.js");
    await handleAddComment({ taskId: 5, body: "Hello" });
    expect(mockPost).toHaveBeenCalledWith("task/5/comments/", { description: "Hello" });
  });
});

describe("users tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleListUsers calls user/list with fields", async () => {
    mockPost.mockResolvedValue({ users: [] });
    const { handleListUsers } = await import("../src/tools/users.js");
    await handleListUsers({});
    expect(mockPost).toHaveBeenCalledWith(
      "user/list",
      expect.objectContaining({ offset: 0, pageSize: 100, fields: expect.any(String) }),
    );
  });

  it("handleGetUser calls GET user/:id with fields", async () => {
    mockGet.mockResolvedValue({ user: { id: 7, name: "Ivan" } });
    const { handleGetUser } = await import("../src/tools/users.js");
    const result = await handleGetUser({ userId: 7 });
    expect(mockGet).toHaveBeenCalledWith("user/7", expect.objectContaining({ fields: expect.any(String) }));
    expect(result).toContain("Ivan");
  });
});

describe("directories tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleListDirectories calls directory/list", async () => {
    mockPost.mockResolvedValue({ directories: [] });
    const { handleListDirectories } = await import("../src/tools/directories.js");
    await handleListDirectories({});
    expect(mockPost).toHaveBeenCalledWith("directory/list", expect.objectContaining({ offset: 0, pageSize: 100 }));
  });

  it("handleListDirectoryEntries calls directory/:id/entry/list", async () => {
    mockPost.mockResolvedValue({ directoryEntries: [] });
    const { handleListDirectoryEntries } = await import("../src/tools/directories.js");
    await handleListDirectoryEntries({ directoryId: 3 });
    expect(mockPost).toHaveBeenCalledWith("directory/3/entry/list", expect.objectContaining({ offset: 0, pageSize: 100 }));
  });
});

describe("custom fields tool", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleListCustomFields calls GET customfield/:objectType", async () => {
    mockGet.mockResolvedValue({ customFields: [] });
    const { handleListCustomFields } = await import("../src/tools/customfields.js");
    await handleListCustomFields({ objectType: "task" });
    expect(mockGet).toHaveBeenCalledWith("customfield/task");
  });
});

describe("datatags tool", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleListDatatags calls datatag/list", async () => {
    mockPost.mockResolvedValue({ dataTags: [] });
    const { handleListDatatags } = await import("../src/tools/datatags.js");
    await handleListDatatags({});
    expect(mockPost).toHaveBeenCalledWith("datatag/list", expect.objectContaining({ offset: 0, pageSize: 100 }));
  });
});

describe("files tools", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it("handleUploadFileFromUrl posts to file/from-url/ with url+name", async () => {
    mockPost.mockResolvedValue({ result: "success", id: 321 });
    const { handleUploadFileFromUrl } = await import("../src/tools/files.js");
    const result = await handleUploadFileFromUrl({ url: "https://x/y.pdf", name: "y.pdf" });
    expect(mockPost).toHaveBeenCalledWith("file/from-url/", { url: "https://x/y.pdf", name: "y.pdf" });
    expect(result).toContain("ID: 321");
  });

  it("handleGetFile calls GET file/:id", async () => {
    mockGet.mockResolvedValue({ file: { id: 9, name: "doc.pdf" } });
    const { handleGetFile } = await import("../src/tools/files.js");
    const result = await handleGetFile({ fileId: 9 });
    expect(mockGet).toHaveBeenCalledWith("file/9");
    expect(result).toContain("doc.pdf");
  });
});
