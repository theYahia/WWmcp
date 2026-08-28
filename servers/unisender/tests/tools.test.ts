import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/client.js", () => ({
  apiCall: vi.fn(),
}));

import { apiCall } from "../src/client.js";
const mockApiCall = vi.mocked(apiCall);

describe("tools", () => {
  beforeEach(() => {
    mockApiCall.mockReset();
  });

  describe("lists", () => {
    it("handleGetLists calls getLists", async () => {
      const lists = [{ id: 1, title: "Main", count: 100 }];
      mockApiCall.mockResolvedValue(lists);
      const { handleGetLists } = await import("../src/tools/lists.js");
      const result = await handleGetLists({});
      expect(mockApiCall).toHaveBeenCalledWith("getLists");
      expect(JSON.parse(result)).toEqual(lists);
    });
  });

  describe("create-list", () => {
    it("handleCreateList passes title", async () => {
      mockApiCall.mockResolvedValue({ id: 5 });
      const { handleCreateList } = await import("../src/tools/create-list.js");
      const result = await handleCreateList({ title: "New List" });
      expect(mockApiCall).toHaveBeenCalledWith("createList", { title: "New List" });
      expect(JSON.parse(result)).toEqual({ id: 5 });
    });
  });

  describe("contacts", () => {
    it("handleGetContacts passes list_id", async () => {
      mockApiCall.mockResolvedValue([{ email: "a@b.com" }]);
      const { handleGetContacts } = await import("../src/tools/contacts.js");
      const result = await handleGetContacts({ list_id: 1 });
      expect(mockApiCall).toHaveBeenCalledWith("exportContacts", { list_id: "1" });
    });
  });

  describe("subscribe", () => {
    it("handleSubscribe passes fields", async () => {
      mockApiCall.mockResolvedValue({ person_id: 42 });
      const { handleSubscribe } = await import("../src/tools/subscribe.js");
      await handleSubscribe({ list_ids: "1", fields: { email: "t@t.com", Name: "Test" } });
      expect(mockApiCall).toHaveBeenCalledWith("subscribe", {
        list_ids: "1",
        "fields[email]": "t@t.com",
        "fields[Name]": "Test",
      });
    });
  });

  describe("create-email", () => {
    it("handleCreateEmail passes all fields", async () => {
      mockApiCall.mockResolvedValue({ message_id: 10 });
      const { handleCreateEmail } = await import("../src/tools/create-email.js");
      await handleCreateEmail({
        sender_name: "Co", sender_email: "i@e.com",
        subject: "Hi", body: "<h1>Hi</h1>", list_id: 1,
      });
      expect(mockApiCall).toHaveBeenCalledWith("createEmailMessage", {
        sender_name: "Co", sender_email: "i@e.com",
        subject: "Hi", body: "<h1>Hi</h1>", list_id: "1",
      });
    });
  });

  describe("send-email", () => {
    it("handleSendEmail passes message_id", async () => {
      mockApiCall.mockResolvedValue({ campaign_id: 20 });
      const { handleSendEmail } = await import("../src/tools/send-email.js");
      await handleSendEmail({ message_id: 10 });
      expect(mockApiCall).toHaveBeenCalledWith("createCampaign", { message_id: "10" });
    });
  });

  describe("campaign-stats", () => {
    it("handleGetCampaignStats passes campaign_id", async () => {
      mockApiCall.mockResolvedValue({ status: "sent" });
      const { handleGetCampaignStats } = await import("../src/tools/campaign-stats.js");
      await handleGetCampaignStats({ campaign_id: 20 });
      expect(mockApiCall).toHaveBeenCalledWith("getCampaignStatus", { campaign_id: "20" });
    });

    it("handleGetCampaignDeliveryStats passes campaign_id", async () => {
      mockApiCall.mockResolvedValue({ delivered: 95 });
      const { handleGetCampaignDeliveryStats } = await import("../src/tools/campaign-stats.js");
      await handleGetCampaignDeliveryStats({ campaign_id: 20 });
      expect(mockApiCall).toHaveBeenCalledWith("getCampaignDeliveryStats", { campaign_id: "20" });
    });
  });

  describe("templates", () => {
    it("handleGetTemplates calls listTemplates", async () => {
      mockApiCall.mockResolvedValue([{ id: 1 }]);
      const { handleGetTemplates } = await import("../src/tools/templates.js");
      await handleGetTemplates({});
      expect(mockApiCall).toHaveBeenCalledWith("listTemplates", {});
    });

    it("handleGetTemplate calls getTemplate", async () => {
      mockApiCall.mockResolvedValue({ id: 1 });
      const { handleGetTemplate } = await import("../src/tools/templates.js");
      await handleGetTemplate({ template_id: 1 });
      expect(mockApiCall).toHaveBeenCalledWith("getTemplate", { template_id: "1" });
    });
  });
});
