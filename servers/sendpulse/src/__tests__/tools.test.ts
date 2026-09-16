import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the client module before importing tools
vi.mock("../client.js", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiGet, apiPost } from "../client.js";
import { handleGetMailingLists } from "../tools/mailing-lists.js";
import { handleSendEmail } from "../tools/send-email.js";
import { handleGetStatistics } from "../tools/statistics.js";
import { handleListCampaigns } from "../tools/campaigns.js";
import { handleListTemplates, handleGetTemplate } from "../tools/templates.js";
import { handleSmtpSend, handleSmtpListEmails } from "../tools/smtp.js";
import { handleListPushWebsites, handleGetPushStatistics, handleCreatePushTask } from "../tools/push.js";

const mockApiGet = vi.mocked(apiGet);
const mockApiPost = vi.mocked(apiPost);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Mailing Lists", () => {
  it("get_mailing_lists calls /addressbooks", async () => {
    const lists = [{ id: 1, name: "Test", all_email_qty: 10 }];
    mockApiGet.mockResolvedValue(lists);
    const result = await handleGetMailingLists({});
    expect(mockApiGet).toHaveBeenCalledWith("/addressbooks");
    expect(JSON.parse(result)).toEqual(lists);
  });
});

describe("Send Email", () => {
  it("send_email posts to /campaigns", async () => {
    mockApiPost.mockResolvedValue({ id: 123, status: 1 });
    const params = {
      sender_name: "Test",
      sender_email: "test@example.com",
      subject: "Hello",
      body: "<h1>Hi</h1>",
      list_id: 1,
    };
    const result = await handleSendEmail(params);
    expect(mockApiPost).toHaveBeenCalledWith("/campaigns", expect.objectContaining({
      sender_name: "Test",
      sender_email: "test@example.com",
      subject: "Hello",
      list_id: 1,
    }));
    expect(JSON.parse(result)).toEqual({ id: 123, status: 1 });
  });

  it("send_email base64-encodes a Cyrillic body as UTF-8", async () => {
    mockApiPost.mockResolvedValue({ id: 1 });
    await handleSendEmail({
      sender_name: "Тест",
      sender_email: "test@example.com",
      subject: "Привет",
      body: "<h1>Привет</h1>",
      list_id: 1,
    });
    const sent = mockApiPost.mock.calls[0]![1] as { body: string };
    expect(Buffer.from(sent.body, "base64").toString("utf8")).toBe("<h1>Привет</h1>");
  });
});

describe("Statistics", () => {
  it("get_statistics calls /campaigns/:id", async () => {
    const stats = { id: 5, open_rate: 42 };
    mockApiGet.mockResolvedValue(stats);
    const result = await handleGetStatistics({ campaign_id: 5 });
    expect(mockApiGet).toHaveBeenCalledWith("/campaigns/5");
    expect(JSON.parse(result)).toEqual(stats);
  });
});

describe("Campaigns", () => {
  it("list_campaigns calls /campaigns with pagination", async () => {
    mockApiGet.mockResolvedValue([{ id: 1 }]);
    await handleListCampaigns({ limit: 50, offset: 10 });
    expect(mockApiGet).toHaveBeenCalledWith("/campaigns?limit=50&offset=10");
  });

  it("list_campaigns uses defaults", async () => {
    mockApiGet.mockResolvedValue([]);
    await handleListCampaigns({});
    expect(mockApiGet).toHaveBeenCalledWith("/campaigns?limit=100&offset=0");
  });
});

describe("Templates", () => {
  it("list_templates calls /templates", async () => {
    mockApiGet.mockResolvedValue([{ id: 1, name: "Welcome" }]);
    await handleListTemplates({});
    expect(mockApiGet).toHaveBeenCalledWith("/templates?owner=me");
  });

  it("get_template calls /template/:id", async () => {
    mockApiGet.mockResolvedValue({ id: 10, name: "Template" });
    await handleGetTemplate({ id: 10 });
    expect(mockApiGet).toHaveBeenCalledWith("/template/10");
  });
});

describe("SMTP", () => {
  it("smtp_send_email posts to /smtp/emails", async () => {
    mockApiPost.mockResolvedValue({ result: true });
    await handleSmtpSend({
      to_name: "User",
      to_email: "user@test.com",
      sender_name: "App",
      sender_email: "app@test.com",
      subject: "Test",
      body_html: "<p>Hello</p>",
    });
    expect(mockApiPost).toHaveBeenCalledWith("/smtp/emails", expect.objectContaining({
      email: expect.objectContaining({
        subject: "Test",
      }),
    }));
  });

  it("smtp_send_email base64-encodes a Cyrillic body as UTF-8", async () => {
    mockApiPost.mockResolvedValue({ result: true });
    await handleSmtpSend({
      to_name: "Пользователь",
      to_email: "user@test.com",
      sender_name: "App",
      sender_email: "app@test.com",
      subject: "Тест",
      body_html: "<p>Здравствуйте</p>",
    });
    const sent = mockApiPost.mock.calls[0]![1] as { email: { html: string } };
    expect(Buffer.from(sent.email.html, "base64").toString("utf8")).toBe("<p>Здравствуйте</p>");
  });

  it("smtp_list_emails calls /smtp/emails", async () => {
    mockApiGet.mockResolvedValue([]);
    await handleSmtpListEmails({});
    expect(mockApiGet).toHaveBeenCalledWith("/smtp/emails?limit=100&offset=0");
  });
});

describe("Push Notifications", () => {
  it("list_push_websites calls /push/websites", async () => {
    mockApiGet.mockResolvedValue([{ id: 1, url: "https://test.com" }]);
    await handleListPushWebsites({});
    expect(mockApiGet).toHaveBeenCalledWith("/push/websites");
  });

  it("get_push_statistics calls /push/websites/:id/tasks", async () => {
    mockApiGet.mockResolvedValue([]);
    await handleGetPushStatistics({ website_id: 42 });
    expect(mockApiGet).toHaveBeenCalledWith("/push/websites/42/tasks");
  });

  it("create_push_task posts to /push/tasks", async () => {
    mockApiPost.mockResolvedValue({ result: true });
    await handleCreatePushTask({
      website_id: 1,
      title: "New post",
      body: "Check it out",
      url: "https://test.com/post",
    });
    expect(mockApiPost).toHaveBeenCalledWith("/push/tasks", {
      title: "New post",
      website_id: 1,
      body: "Check it out",
      link: "https://test.com/post",
    });
  });
});
