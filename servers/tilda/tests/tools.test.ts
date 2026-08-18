import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  handleGetProjects,
  handleGetProjectInfo,
  handleGetPages,
  handleGetPage,
  handleGetPageBody,
  handleGetPageExport,
  handleGetPageExportBody,
  getPageSchema,
  getPagesSchema,
  getProjectInfoSchema,
} from "../src/tools/pages.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  process.env.TILDA_PUBLIC_KEY = "test-pub";
  process.env.TILDA_SECRET_KEY = "test-sec";
  mockFetch.mockReset();
});

afterEach(() => {
  delete process.env.TILDA_PUBLIC_KEY;
  delete process.env.TILDA_SECRET_KEY;
});

function okResponse(result: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: "FOUND", result }),
  });
}

describe("get_projects", () => {
  it("returns projects list", async () => {
    const projects = [{ id: "1", title: "My Site" }];
    mockFetch.mockReturnValueOnce(okResponse(projects));

    const out = await handleGetProjects({});
    expect(JSON.parse(out)).toEqual(projects);
    expect(mockFetch).toHaveBeenCalledOnce();
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("getprojectslist");
    expect(url).toContain("publickey=test-pub");
    expect(url).toContain("secretkey=test-sec");
  });
});

describe("get_project_info", () => {
  it("returns project info", async () => {
    const info = { id: "1", title: "My Site", customdomain: "example.com" };
    mockFetch.mockReturnValueOnce(okResponse(info));

    const out = await handleGetProjectInfo({ projectid: "1" });
    expect(JSON.parse(out)).toEqual(info);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("getprojectinfo");
    expect(url).toContain("projectid=1");
  });
});

describe("get_pages", () => {
  it("returns pages list", async () => {
    const pages = [{ id: "10", projectid: "1", title: "Home" }];
    mockFetch.mockReturnValueOnce(okResponse(pages));

    const out = await handleGetPages({ projectid: "1" });
    expect(JSON.parse(out)).toEqual(pages);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("getpageslist");
    expect(url).toContain("projectid=1");
  });
});

describe("get_page", () => {
  it("returns full page data", async () => {
    const page = { id: "10", title: "Home", html: "<h1>Hi</h1>", css: "", js: "" };
    mockFetch.mockReturnValueOnce(okResponse(page));

    const out = await handleGetPage({ pageid: "10" });
    expect(JSON.parse(out)).toEqual(page);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("getpagefull");
    expect(url).toContain("pageid=10");
  });
});

describe("get_page_export", () => {
  it("returns export data", async () => {
    const exp = { id: "10", title: "Home", html: "<h1>Hi</h1>", img: [] };
    mockFetch.mockReturnValueOnce(okResponse(exp));

    const out = await handleGetPageExport({ pageid: "10" });
    expect(JSON.parse(out)).toEqual(exp);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("getpagefullexport");
    expect(url).toContain("pageid=10");
  });
});

describe("get_page_body", () => {
  it("calls the getpage (body-only) endpoint", async () => {
    const page = { id: "10", title: "Home", html: "<div>Body</div>" };
    mockFetch.mockReturnValueOnce(okResponse(page));

    const out = await handleGetPageBody({ pageid: "10" });
    expect(JSON.parse(out)).toEqual(page);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/getpage/");
    expect(url).not.toContain("getpagefull");
    expect(url).toContain("pageid=10");
  });
});

describe("get_page_export_body", () => {
  it("calls the getpageexport (body export) endpoint", async () => {
    const exp = { id: "10", title: "Home", html: "<div>Body</div>", img: [{ from: "a", to: "b" }] };
    mockFetch.mockReturnValueOnce(okResponse(exp));

    const out = await handleGetPageExportBody({ pageid: "10" });
    expect(JSON.parse(out)).toEqual(exp);
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("/getpageexport/");
    expect(url).not.toContain("getpagefullexport");
    expect(url).toContain("pageid=10");
  });
});

describe("webconfig", () => {
  it("forwards webconfig to getprojectinfo", async () => {
    mockFetch.mockReturnValueOnce(okResponse({ id: "1" }));
    await handleGetProjectInfo({ projectid: "1", webconfig: "nginx" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).toContain("webconfig=nginx");
  });

  it("omits webconfig when not provided", async () => {
    mockFetch.mockReturnValueOnce(okResponse({ id: "1" }));
    await handleGetProjectInfo({ projectid: "1" });
    const url = mockFetch.mock.calls[0][0] as string;
    expect(url).not.toContain("webconfig");
  });
});

describe("metadata_only", () => {
  it("strips html/css/js and summarizes them", async () => {
    const page = { id: "10", title: "Home", html: "<h1>Hi</h1>", css: ".a{}", js: "var x=1", alias: "/home" };
    mockFetch.mockReturnValueOnce(okResponse(page));

    const out = JSON.parse(await handleGetPage({ pageid: "10", metadata_only: true }));
    expect(out.html).toBeUndefined();
    expect(out.css).toBeUndefined();
    expect(out.js).toBeUndefined();
    expect(out.id).toBe("10");
    expect(out.alias).toBe("/home");
    expect(out.html_info).toContain("символов");
  });

  it("returns full content when metadata_only is false/omitted", async () => {
    const page = { id: "10", title: "Home", html: "<h1>Hi</h1>" };
    mockFetch.mockReturnValueOnce(okResponse(page));
    const out = JSON.parse(await handleGetPage({ pageid: "10" }));
    expect(out.html).toBe("<h1>Hi</h1>");
  });
});

describe("input validation", () => {
  it("rejects empty pageid", () => {
    expect(getPageSchema.safeParse({ pageid: "" }).success).toBe(false);
  });
  it("rejects empty projectid", () => {
    expect(getPagesSchema.safeParse({ projectid: "" }).success).toBe(false);
  });
  it("rejects invalid webconfig value", () => {
    expect(getProjectInfoSchema.safeParse({ projectid: "1", webconfig: "apache" }).success).toBe(false);
  });
  it("accepts valid webconfig value", () => {
    expect(getProjectInfoSchema.safeParse({ projectid: "1", webconfig: "htaccess" }).success).toBe(true);
  });
});

describe("auth errors", () => {
  it("throws when keys missing", async () => {
    delete process.env.TILDA_PUBLIC_KEY;
    delete process.env.TILDA_SECRET_KEY;
    await expect(handleGetProjects({})).rejects.toThrow("TILDA_PUBLIC_KEY");
  });
});

describe("API error handling", () => {
  it("throws on Tilda ERROR status", async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ERROR", message: "Invalid key" }),
      }),
    );
    await expect(handleGetProjects({})).rejects.toThrow("Invalid key");
  });
});
