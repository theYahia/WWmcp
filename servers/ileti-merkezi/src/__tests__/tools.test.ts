import { describe, it, expect, vi, afterEach } from "vitest";
import { z } from "zod";
import { IletiMerkeziClient } from "../client.js";
import { buildTools, type ToolRegistration } from "../tools.js";
import * as schemas from "../schemas.js";

interface QueuedResponse {
  status: number;
  body: unknown;
}

const OK = { status: 200, body: { response: { status: { code: 200 }, order: { id: "ord_42" } } } };

function harness(queue: QueuedResponse[] = [OK]) {
  const calls: Array<{ url: string; body: any }> = [];
  const impl = vi.fn(async (url: string, options: RequestInit) => {
    const next = queue.shift() ?? OK;
    calls.push({ url, body: JSON.parse(options.body as string) });
    return { status: next.status, text: async () => JSON.stringify(next.body) };
  }) as unknown as typeof fetch;
  const client = new IletiMerkeziClient({ key: "k", hash: "h" }, { fetchImpl: impl });
  const tools = buildTools(client);
  const get = (name: string): ToolRegistration => {
    const t = tools.find((x) => x.name === name);
    if (!t) throw new Error(`tool ${name} not found`);
    return t;
  };
  return { calls, tools, get };
}

/** Validate+default args through the tool's own zod shape, then run the handler. */
function parse(shape: z.ZodRawShape, input: Record<string, unknown>) {
  return z.object(shape).parse(input) as Record<string, unknown>;
}

afterEach(() => {
  delete process.env.ILETIMERKEZI_SENDER;
  delete process.env.ILETI_SENDER;
});

describe("tool surface", () => {
  it("registers exactly the 11 real endpoints", () => {
    const { tools } = harness();
    expect(tools.map((t) => t.name).sort()).toEqual(
      [
        "add_blacklist",
        "cancel_order",
        "delete_blacklist",
        "get_balance",
        "get_blacklist",
        "get_report",
        "get_reports",
        "get_sender",
        "iys_check",
        "iys_register",
        "send_sms",
      ].sort(),
    );
  });

  it("does NOT expose the fabricated legacy tools", () => {
    const { tools } = harness();
    const names = tools.map((t) => t.name);
    for (const fake of ["send_bulk_sms", "create_contact_group", "add_contacts", "list_senders"]) {
      expect(names).not.toContain(fake);
    }
  });
});

describe("send_sms", () => {
  it("builds the nested send payload with the (sic) 'receipents' field", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, {
      to: "5551112233",
      message: "hi",
      sender: "APITEST",
    });
    const res = await get("send_sms").handler(args);

    expect(res.isError).toBe(false);
    expect(calls[0].url).toBe("https://api.iletimerkezi.com/v1/send-sms/json");
    const order = calls[0].body.request.order;
    expect(order.sender).toBe("APITEST");
    expect(order.message.text).toBe("hi");
    expect(order.message.receipents.number).toEqual(["5551112233"]);
  });

  it("accepts an array of numbers for bulk via the same endpoint", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, {
      to: ["5551112233", "5559998877"],
      message: "bulk",
      sender: "APITEST",
    });
    await get("send_sms").handler(args);
    expect(calls[0].body.request.order.message.receipents.number).toEqual([
      "5551112233",
      "5559998877",
    ]);
  });

  it("maps message_type=transactional → iys '0' (default)", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, {
      to: "5551112233",
      message: "otp",
      sender: "APITEST",
    });
    await get("send_sms").handler(args);
    expect(calls[0].body.request.order.iys).toBe("0");
  });

  it("maps message_type=commercial → iys '1' with iysList", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, {
      to: "5551112233",
      message: "sale",
      sender: "APITEST",
      message_type: "commercial",
    });
    await get("send_sms").handler(args);
    expect(calls[0].body.request.order.iys).toBe("1");
    expect(calls[0].body.request.order.iysList).toBe("BIREYSEL");
  });

  it("falls back to ILETIMERKEZI_SENDER when sender is omitted", async () => {
    process.env.ILETIMERKEZI_SENDER = "ENVHEADER";
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, { to: "5551112233", message: "hi" });
    await get("send_sms").handler(args);
    expect(calls[0].body.request.order.sender).toBe("ENVHEADER");
  });

  it("returns isError (no API call) when no sender is available", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.sendSmsShape, { to: "5551112233", message: "hi" });
    const res = await get("send_sms").handler(args);
    expect(res.isError).toBe(true);
    expect(calls).toHaveLength(0);
    expect((res.content[0] as { text: string }).text).toMatch(/sender header/i);
  });

  it("rejects an empty message at the schema layer", () => {
    expect(() =>
      parse(schemas.sendSmsShape, { to: "5551112233", message: "", sender: "APITEST" }),
    ).toThrow();
  });
});

describe("read + blacklist + iys payloads", () => {
  it("get_balance sends only authentication", async () => {
    const { calls, get } = harness([
      {
        status: 200,
        body: { response: { status: { code: 200 }, balance: { amount: "12.5", sms: "300" } } },
      },
    ]);
    const res = await get("get_balance").handler({});
    expect(calls[0].url).toMatch(/get-balance\/json$/);
    expect(calls[0].body.request.order).toBeUndefined();
    expect((res.content[0] as { text: string }).text).toMatch(/12\.5 TL/);
  });

  it("get_report nests id/page/rowCount under order", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.getReportShape, { order_id: 99 });
    await get("get_report").handler(args);
    expect(calls[0].body.request.order).toEqual({ id: 99, page: 1, rowCount: 1000 });
  });

  it("get_reports nests start/end/page under filter", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.getReportsShape, { start: "2026-06-01", end: "2026-06-05" });
    await get("get_reports").handler(args);
    expect(calls[0].body.request.filter).toEqual({
      start: "2026-06-01",
      end: "2026-06-05",
      page: 1,
    });
  });

  it("get_blacklist omits filter when no dates given", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.getBlacklistShape, {});
    await get("get_blacklist").handler(args);
    expect(calls[0].body.request.blacklist).toEqual({ page: 1, rowCount: 1000 });
  });

  it("add_blacklist / delete_blacklist nest the number", async () => {
    const { calls, get } = harness([OK, OK]);
    await get("add_blacklist").handler(
      parse(schemas.blacklistNumberShape, { number: "5551112233" }),
    );
    await get("delete_blacklist").handler(
      parse(schemas.blacklistNumberShape, { number: "5551112233" }),
    );
    expect(calls[0].url).toMatch(/add-blacklist\/json$/);
    expect(calls[0].body.request.blacklist).toEqual({ number: "5551112233" });
    expect(calls[1].url).toMatch(/delete-blacklist\/json$/);
  });

  it("iys_register maps snake_case consents to the camelCase API list", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.iysRegisterShape, {
      brand_code: 123,
      consents: [
        {
          recipient: "5551112233",
          recipient_type: "BIREYSEL",
          type: "MESAJ",
          status: "ONAY",
          source: "HS_WEB",
          consent_date: "2026-06-22 10:00:00",
        },
      ],
    });
    await get("iys_register").handler(args);
    expect(calls[0].url).toMatch(/consent\/create\/json$/);
    const consent = calls[0].body.request.consent;
    expect(consent.brandCode).toBe(123);
    expect(consent.list[0]).toEqual({
      recipient: "5551112233",
      recipientType: "BIREYSEL",
      type: "MESAJ",
      status: "ONAY",
      source: "HS_WEB",
      consentDate: "2026-06-22 10:00:00",
    });
  });

  it("iys_check sends the consent lookup fields", async () => {
    const { calls, get } = harness();
    const args = parse(schemas.iysCheckShape, {
      brand_code: "B1",
      recipient: "5551112233",
      recipient_type: "TACIR",
      type: "EPOSTA",
    });
    await get("iys_check").handler(args);
    expect(calls[0].url).toMatch(/consent\/show\/json$/);
    expect(calls[0].body.request.consent).toEqual({
      brandCode: "B1",
      recipient: "5551112233",
      recipientType: "TACIR",
      type: "EPOSTA",
    });
  });
});

describe("error handling", () => {
  it("returns isError=true with guidance on a 401", async () => {
    const { get } = harness([
      { status: 401, body: { response: { status: { code: 401, message: "bad creds" } } } },
    ]);
    const res = await get("get_balance").handler({});
    expect(res.isError).toBe(true);
    const text = (res.content[0] as { text: string }).text;
    expect(text).toMatch(/Authentication failed/i);
    expect(text).toMatch(/Allow API access/i);
  });

  it("returns isError=true on a transport throw without crashing", async () => {
    const impl = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;
    const client = new IletiMerkeziClient({ key: "k", hash: "h" }, { fetchImpl: impl });
    const send = buildTools(client).find((t) => t.name === "get_sender")!;
    const res = await send.handler({});
    expect(res.isError).toBe(true);
    expect((res.content[0] as { text: string }).text).toMatch(/network down/);
  });
});
