import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;
process.env.PAYMONGO_SECRET_KEY = "sk_test_key";

import { handleCreateLink, handleGetLink, handleArchiveLink } from "../links.js";
import {
  handleCreateWebhook,
  handleListWebhooks,
  handleUpdateWebhook,
  handleVerifyWebhookSignature,
} from "../webhooks.js";
import {
  handleCreatePaymentMethod,
  handleGetPaymentMethod,
} from "../payment-methods.js";
import { handleCreateCustomer, handleListCustomers } from "../customers.js";
import { handleGetRefund, handleListRefunds } from "../refunds.js";
import { __resetClientForTests } from "../../client.js";

function ok(json: unknown) {
  return { ok: true, json: async () => json };
}
function lastUrl(): string {
  return String(mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0]);
}
function lastInit(): RequestInit {
  return mockFetch.mock.calls[mockFetch.mock.calls.length - 1][1] as RequestInit;
}

beforeEach(() => {
  vi.clearAllMocks();
  __resetClientForTests();
});

describe("links", () => {
  it("create_link posts to /links with the amount", async () => {
    mockFetch.mockResolvedValueOnce(
      ok({ data: { id: "link_1", attributes: { checkout_url: "https://pm.link/x" } } }),
    );
    const result = await handleCreateLink({ amount: 10000, description: "Test", currency: "PHP" });
    expect(JSON.parse(result).data.id).toBe("link_1");
    expect(lastUrl()).toContain("/links");
    expect(lastInit().method).toBe("POST");
    const body = JSON.parse(String(lastInit().body));
    expect(body.data.attributes).toMatchObject({ amount: 10000, currency: "PHP", description: "Test" });
  });

  it("get_link by id hits /links/{id}", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "link_1" } }));
    await handleGetLink({ link_id: "link_1" });
    expect(lastUrl()).toContain("/links/link_1");
  });

  it("get_link by reference_number uses the query param", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: [{ id: "link_1" }] }));
    const result = await handleGetLink({ reference_number: "ABC123" });
    expect(lastUrl()).toContain("reference_number=ABC123");
    expect(Array.isArray(JSON.parse(result).data)).toBe(true);
  });

  it("get_link rejects when neither id nor reference is given", async () => {
    await expect(handleGetLink({})).rejects.toThrow(/either link_id or reference_number/);
  });

  it("archive_link toggles the archive endpoint", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "link_1" } }));
    await handleArchiveLink({ link_id: "link_1", archived: true });
    expect(lastUrl()).toContain("/links/link_1/archive");
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "link_1" } }));
    await handleArchiveLink({ link_id: "link_1", archived: false });
    expect(lastUrl()).toContain("/links/link_1/unarchive");
  });
});

describe("webhooks", () => {
  it("create_webhook posts url + events", async () => {
    mockFetch.mockResolvedValueOnce(
      ok({ data: { id: "hook_1", attributes: { secret_key: "whsk_x" } } }),
    );
    const result = await handleCreateWebhook({
      url: "https://ex.com/hook",
      events: ["payment.paid"],
    });
    expect(JSON.parse(result).data.id).toBe("hook_1");
    expect(lastUrl()).toContain("/webhooks");
  });

  it("list_webhooks returns the list", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: [{ id: "hook_1" }, { id: "hook_2" }] }));
    const result = await handleListWebhooks({});
    expect(JSON.parse(result).data).toHaveLength(2);
  });

  it("update_webhook(enabled:false) calls the disable endpoint", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "hook_1", attributes: { status: "disabled" } } }));
    await handleUpdateWebhook({ webhook_id: "hook_1", enabled: false });
    expect(lastUrl()).toContain("/webhooks/hook_1/disable");
  });

  it("update_webhook with nothing to change throws", async () => {
    await expect(handleUpdateWebhook({ webhook_id: "hook_1" })).rejects.toThrow(/Nothing to update/);
  });

  // Known HMAC vector (computed with node:crypto):
  //   secret = whsk_test_secret, t = 1700000000,
  //   body   = {"data":{"id":"evt_test","type":"event"}}
  const BODY = '{"data":{"id":"evt_test","type":"event"}}';
  const T = "1700000000";
  const SIG = "c9a9caba4e490f2713f1cb47300eadb9b073b893b293fc3057c69d1cb4edea42";
  const SECRET = "whsk_test_secret";

  it("verify_webhook_signature accepts a valid signature (known vector, no API call)", async () => {
    const result = await handleVerifyWebhookSignature({
      payload: BODY,
      signature_header: `t=${T},te=${SIG},li=deadbeef`,
      webhook_signing_secret: SECRET,
      mode: "test",
    });
    expect(JSON.parse(result).valid).toBe(true);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("verify_webhook_signature rejects a tampered signature", async () => {
    const result = await handleVerifyWebhookSignature({
      payload: BODY,
      signature_header: `t=${T},te=deadbeefdeadbeef,li=deadbeef`,
      webhook_signing_secret: SECRET,
      mode: "test",
    });
    expect(JSON.parse(result).valid).toBe(false);
  });

  it("verify_webhook_signature checks the live (li) segment in live mode", async () => {
    const result = await handleVerifyWebhookSignature({
      payload: BODY,
      signature_header: `t=${T},te=wrongwrong,li=${SIG}`,
      webhook_signing_secret: SECRET,
      mode: "live",
    });
    expect(JSON.parse(result).valid).toBe(true);
  });

  it("verify_webhook_signature reports a malformed header", async () => {
    const result = await handleVerifyWebhookSignature({
      payload: BODY,
      signature_header: `t=${T}`,
      webhook_signing_secret: SECRET,
      mode: "test",
    });
    const parsed = JSON.parse(result);
    expect(parsed.valid).toBe(false);
    expect(parsed.reason).toMatch(/Malformed/);
  });

  it("verify_webhook_signature enforces the tolerance window (replay protection)", async () => {
    vi.useFakeTimers();
    try {
      // Clock just after the signed timestamp -> within tolerance.
      vi.setSystemTime(Number(T) * 1000 + 5_000);
      const fresh = await handleVerifyWebhookSignature({
        payload: BODY,
        signature_header: `t=${T},te=${SIG},li=x`,
        webhook_signing_secret: SECRET,
        mode: "test",
        tolerance_seconds: 300,
      });
      expect(JSON.parse(fresh).valid).toBe(true);

      // Clock an hour later -> outside the 300s window.
      vi.setSystemTime(Number(T) * 1000 + 3_600_000);
      const stale = JSON.parse(
        await handleVerifyWebhookSignature({
          payload: BODY,
          signature_header: `t=${T},te=${SIG},li=x`,
          webhook_signing_secret: SECRET,
          mode: "test",
          tolerance_seconds: 300,
        }),
      );
      expect(stale.valid).toBe(false);
      expect(stale.within_tolerance).toBe(false);
      expect(stale.signature_valid).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("payment methods", () => {
  it("create_payment_method posts to /payment_methods", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "pm_1", attributes: { type: "card" } } }));
    const result = await handleCreatePaymentMethod({
      type: "card",
      details: { card_number: "4242424242424242", exp_month: 12, exp_year: 30, cvc: "123" },
    });
    expect(JSON.parse(result).data.id).toBe("pm_1");
    expect(lastUrl()).toContain("/payment_methods");
    const body = JSON.parse(String(lastInit().body));
    expect(body.data.attributes).toMatchObject({
      type: "card",
      details: { card_number: "4242424242424242", exp_month: 12, exp_year: 30, cvc: "123" },
    });
  });

  it("get_payment_method hits /payment_methods/{id}", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "pm_1" } }));
    await handleGetPaymentMethod({ payment_method_id: "pm_1" });
    expect(lastUrl()).toContain("/payment_methods/pm_1");
  });
});

describe("customers", () => {
  it("create_customer posts to /customers", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "cus_1" } }));
    const result = await handleCreateCustomer({
      first_name: "Juan",
      last_name: "Cruz",
      email: "juan@example.com",
      phone: "+639170000000",
      default_device: "email",
    });
    expect(JSON.parse(result).data.id).toBe("cus_1");
    expect(lastUrl()).toContain("/customers");
    const body = JSON.parse(String(lastInit().body));
    expect(body.data.attributes).toMatchObject({
      first_name: "Juan",
      last_name: "Cruz",
      email: "juan@example.com",
      phone: "+639170000000",
      default_device: "email",
    });
  });

  it("list_customers passes the limit query param", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: [{ id: "cus_1" }] }));
    await handleListCustomers({ limit: 10 });
    expect(lastUrl()).toContain("/customers?limit=10");
  });
});

describe("refunds (read)", () => {
  it("get_refund hits /refunds/{id}", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: { id: "ref_1" } }));
    await handleGetRefund({ refund_id: "ref_1" });
    expect(lastUrl()).toContain("/refunds/ref_1");
  });

  it("list_refunds passes the limit query param", async () => {
    mockFetch.mockResolvedValueOnce(ok({ data: [] }));
    await handleListRefunds({ limit: 5 });
    expect(lastUrl()).toContain("/refunds?limit=5");
  });
});
