import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.YOOKASSA_SHOP_ID = "test_shop_123";
process.env.YOOKASSA_SECRET_KEY = "test_secret_key";

import {
  handleCreateWebhook,
  handleListWebhooks,
  handleDeleteWebhook,
} from "../src/tools/webhooks.js";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function mockOk(data: unknown) {
  return { ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) };
}

beforeEach(() => { mockFetch.mockReset(); });

describe("webhooks", () => {
  it("creates a webhook", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ id: "wh_1", event: "payment.succeeded", url: "https://example.com/hook" }));

    const result = JSON.parse(await handleCreateWebhook({
      event: "payment.succeeded",
      url: "https://example.com/hook",
    }));

    expect(result.id).toBe("wh_1");
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.event).toBe("payment.succeeded");
    expect(body.url).toBe("https://example.com/hook");
  });

  it("lists webhooks", async () => {
    mockFetch.mockResolvedValueOnce(mockOk({ type: "list", items: [{ id: "wh_1" }, { id: "wh_2" }] }));

    const result = JSON.parse(await handleListWebhooks());
    expect(result.items).toHaveLength(2);
  });

  it("deletes a webhook", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 204, json: async () => ({}), text: async () => "" });

    const result = JSON.parse(await handleDeleteWebhook({ webhook_id: "wh_1" }));
    expect(result.success).toBe(true);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("/webhooks/wh_1");
    expect(opts.method).toBe("DELETE");
  });
});
