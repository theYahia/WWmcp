import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TochkaBankClient } from "../client.js";
import { wrapTool } from "./_shared.js";
import { listAccountsTool } from "./accounts.js";
import { getCompanyInfoTool } from "./customers.js";
import { createPaymentTool, getPaymentStatusTool } from "./payments.js";

function stub(partial: Partial<TochkaBankClient>): TochkaBankClient {
  return partial as TochkaBankClient;
}

describe("wrapTool", () => {
  it("returns structuredContent on success", async () => {
    const client = stub({ listAccounts: async () => [{ accountId: "a" }] });
    const result = await wrapTool(client, listAccountsTool)({});
    expect(result.isError).toBeUndefined();
    expect(result.structuredContent).toEqual({ accounts: [{ accountId: "a" }] });
  });

  it("returns a redacted isError result on throw", async () => {
    const client = stub({
      listAccounts: async () => {
        throw new Error("boom inn 7707083893");
      },
    });
    const result = await wrapTool(client, listAccountsTool)({});
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Error:");
    expect(result.content[0].text).not.toContain("7707083893");
  });
});

describe("create_payment guardrails", () => {
  const baseArgs = {
    from_account: "40702810000000001234",
    to_account: "40702810000000005678",
    to_bik: "044525225",
    to_name: "OOO Test",
    amount_rub: 75000.5,
    purpose: "services",
  };

  beforeEach(() => {
    delete process.env.TOCHKA_MAX_PAYMENT_RUB;
    delete process.env.TOCHKA_ALLOWED_RECIPIENTS;
  });

  it("returns a preview and does NOT call the API without confirm", async () => {
    const createPaymentForSign = vi.fn();
    const client = stub({ createPaymentForSign });
    const result = await createPaymentTool.handler(client, { ...baseArgs });
    expect(result.structuredContent?.status).toBe("preview");
    expect(createPaymentForSign).not.toHaveBeenCalled();
  });

  it("forces a preview when dry_run is set even with confirm", async () => {
    const createPaymentForSign = vi.fn();
    const client = stub({ createPaymentForSign });
    const result = await createPaymentTool.handler(client, {
      ...baseArgs,
      confirm: true,
      dry_run: true,
    });
    expect(result.structuredContent?.status).toBe("preview");
    expect(createPaymentForSign).not.toHaveBeenCalled();
  });

  it("blocks amounts over the limit", async () => {
    const createPaymentForSign = vi.fn();
    const client = stub({ createPaymentForSign });
    const result = await createPaymentTool.handler(client, {
      ...baseArgs,
      amount_rub: 5_000_000,
      confirm: true,
    });
    expect(result.structuredContent?.status).toBe("blocked");
    expect(createPaymentForSign).not.toHaveBeenCalled();
  });

  it("creates a for-sign payment with confirm:true and the amount in rubles", async () => {
    const createPaymentForSign = vi.fn(async () => ({ requestId: "req1" }));
    const client = stub({ createPaymentForSign });
    const result = await createPaymentTool.handler(client, {
      ...baseArgs,
      confirm: true,
      payment_date: "2026-06-23",
    });
    expect(result.structuredContent?.status).toBe("created_for_sign");
    expect(result.structuredContent?.requestId).toBe("req1");
    expect(createPaymentForSign).toHaveBeenCalledTimes(1);
    expect(createPaymentForSign.mock.calls[0][0]).toMatchObject({
      accountCode: "40702810000000001234",
      counterpartyAccountNumber: "40702810000000005678",
      counterpartyBankBic: "044525225",
      counterpartyName: "OOO Test",
      paymentAmount: 75000.5,
      paymentPurpose: "services",
      paymentDate: "2026-06-23",
    });
  });
});

describe("get_payment_status", () => {
  it("returns the status", async () => {
    const client = stub({
      getPaymentStatus: async () => ({ requestId: "r", status: "WaitingForSign" }),
    });
    const result = await getPaymentStatusTool.handler(client, { request_id: "r" });
    expect(result.structuredContent?.status).toBe("WaitingForSign");
  });
});

describe("get_company_info", () => {
  it("auto-selects the single customer", async () => {
    const client = stub({
      listCustomers: async () => [{ customerCode: "C1" }],
      getCustomer: async (code: string) => ({ customerCode: code, name: "ACME" }),
    });
    const result = await getCompanyInfoTool.handler(client, {});
    expect((result.structuredContent?.customer as { customerCode: string }).customerCode).toBe(
      "C1",
    );
  });

  it("errors when multiple customers and no code is given", async () => {
    const client = stub({
      listCustomers: async () => [{ customerCode: "C1" }, { customerCode: "C2" }],
    });
    await expect(getCompanyInfoTool.handler(client, {})).rejects.toThrow(/Multiple/);
  });
});
