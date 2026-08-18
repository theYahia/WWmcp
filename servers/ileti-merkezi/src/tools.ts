import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ZodRawShape } from "zod";
import { IletiMerkeziClient, type ApiResult } from "./client.js";
import { extractApiStatusCode, extractApiStatusMessage, guidanceFor, isOk } from "./errors.js";
import {
  summarizeBalance,
  summarizeBlacklist,
  summarizeCancel,
  summarizeReport,
  summarizeSend,
  summarizeSenders,
} from "./responses.js";
import {
  blacklistNumberShape,
  cancelOrderShape,
  emptyShape,
  getBlacklistShape,
  getReportShape,
  getReportsShape,
  iysCheckShape,
  iysRegisterShape,
  sendSmsShape,
} from "./schemas.js";

const DOCS_API = "https://www.iletimerkezi.com/en/docs/api";
const docUrl = (slug: string) => `https://www.iletimerkezi.com/docs/api/${slug}`;

type Summarizer = (body: unknown) => string | null;
type ArgsOf<S extends ZodRawShape> = z.infer<z.ZodObject<S>>;

export interface ToolRegistration {
  name: string;
  config: { title: string; description: string; inputSchema: ZodRawShape };
  handler: (args: Record<string, unknown>) => Promise<CallToolResult>;
}

function textResult(text: string, isError: boolean): CallToolResult {
  return { isError, content: [{ type: "text" as const, text }] };
}

/** Render an ApiResult into a CallToolResult: summary + highlights + raw JSON. */
function render(
  path: string,
  api: ApiResult,
  summarize: Summarizer | undefined,
  reference: string,
): CallToolResult {
  const apiCode = extractApiStatusCode(api.body);
  const ok = isOk(api.status, apiCode);
  const apiMsg = extractApiStatusMessage(api.body);

  const head =
    `${ok ? "✅" : "❌"} ${path} ${ok ? "succeeded" : "failed"} ` +
    `(HTTP ${api.status}${apiCode !== null ? `, response.status.code ${apiCode}` : ""})` +
    `${apiMsg ? ` — ${apiMsg}` : ""}.`;

  const highlights = ok && summarize ? summarize(api.body) : null;
  const guidance = ok ? "" : guidanceFor(apiCode, reference);
  const raw = "```json\n" + JSON.stringify(api.body, null, 2) + "\n```";

  const text = [head, highlights, guidance, `Request URL: ${api.requestUrl}`, raw]
    .filter(Boolean)
    .join("\n\n");
  return textResult(text, !ok);
}

/**
 * Build the full set of tool registrations bound to a client. Each handler
 * catches its own transport errors and always returns a CallToolResult with the
 * correct `isError` flag (per the MCP convention) — it never throws.
 */
export function buildTools(client: IletiMerkeziClient): ToolRegistration[] {
  const call = async (
    path: string,
    input: Record<string, unknown>,
    summarize: Summarizer | undefined,
    reference: string,
  ): Promise<CallToolResult> => {
    let api: ApiResult;
    try {
      api = await client.call(path, input);
    } catch (e) {
      return textResult(`❌ İletiMerkezi error calling ${path}: ${(e as Error).message}`, true);
    }
    return render(path, api, summarize, reference);
  };

  return [
    {
      name: "send_sms",
      config: {
        title: "Send SMS",
        description:
          "Send an SMS to one recipient or many (bulk, up to 50000) via İletiMerkezi. " +
          "Single and bulk use the same call — pass `to` as a string or an array. " +
          "For OTP/one-time codes, send to a single recipient with message_type=transactional. " +
          "İYS (Turkey commercial-message consent): set message_type=commercial for any marketing " +
          "content (enables real-time consent validation); transactional messages are exempt. " +
          `Reference: ${docUrl("send-sms")}`,
        inputSchema: sendSmsShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof sendSmsShape>;
        const numbers = Array.isArray(args.to) ? args.to : [args.to];
        const sender = args.sender ?? process.env.ILETIMERKEZI_SENDER ?? process.env.ILETI_SENDER;
        if (!sender) {
          return textResult(
            "❌ No sender header provided. Pass `sender` (3–11 chars, panel-approved; " +
              "use APITEST for sandbox) or set ILETIMERKEZI_SENDER in your MCP config.",
            true,
          );
        }
        const iys = args.iys ?? (args.message_type === "commercial" ? "1" : "0");
        const order = {
          sender,
          sendDateTime: args.schedule_at ?? "",
          iys,
          iysList: args.iys_list,
          message: { text: args.message, receipents: { number: numbers } },
        };
        return call("/send-sms/json", { order }, summarizeSend, docUrl("send-sms"));
      },
    },
    {
      name: "cancel_order",
      config: {
        title: "Cancel scheduled order",
        description:
          "Cancel a future-scheduled SMS order before it is dispatched. " +
          `Reference: ${docUrl("cancel-order")}`,
        inputSchema: cancelOrderShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof cancelOrderShape>;
        return call(
          "/cancel-order/json",
          { order: { id: args.order_id } },
          summarizeCancel,
          docUrl("cancel-order"),
        );
      },
    },
    {
      name: "get_report",
      config: {
        title: "Delivery report (by order)",
        description:
          "Get the per-recipient delivery report for one order id (status counts + each number's " +
          "delivery state). Order status: 113 SENDING / 114 COMPLETED / 115 CANCELED. " +
          "Message status: 110 WAITING / 111 DELIVERED / 112 UNDELIVERED. " +
          `Reference: ${docUrl("get-report")}`,
        inputSchema: getReportShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof getReportShape>;
        return call(
          "/get-report/json",
          { order: { id: args.order_id, page: args.page, rowCount: args.row_count } },
          summarizeReport,
          docUrl("get-report"),
        );
      },
    },
    {
      name: "get_reports",
      config: {
        title: "Order summaries (by date range)",
        description:
          "List order summaries within a date range (YYYY-MM-DD, range ≤ 10 days). " +
          `Reference: ${docUrl("get-reports")}`,
        inputSchema: getReportsShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof getReportsShape>;
        return call(
          "/get-reports/json",
          { filter: { start: args.start, end: args.end, page: args.page } },
          undefined,
          docUrl("get-reports"),
        );
      },
    },
    {
      name: "get_balance",
      config: {
        title: "Account balance",
        description:
          "Get account balance (TL) and remaining SMS credits. Side-effect free, costs nothing. " +
          `Reference: ${docUrl("get-balance")}`,
        inputSchema: emptyShape,
      },
      handler: async () => call("/get-balance/json", {}, summarizeBalance, docUrl("get-balance")),
    },
    {
      name: "get_sender",
      config: {
        title: "List sender headers",
        description:
          "List the approved sender headers (başlık) on the account. A header must be BTK-approved " +
          "before it can be used; APITEST is available as a sandbox sender. " +
          `Reference: ${docUrl("get-sender")}`,
        inputSchema: emptyShape,
      },
      handler: async () => call("/get-sender/json", {}, summarizeSenders, docUrl("get-sender")),
    },
    {
      name: "get_blacklist",
      config: {
        title: "List blacklist",
        description:
          "List blocked numbers (paginated), optionally filtered by a datetime range " +
          "(YYYY-MM-DD HH:MM:SS). " +
          `Reference: ${docUrl("get-blacklist")}`,
        inputSchema: getBlacklistShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof getBlacklistShape>;
        const blacklist: Record<string, unknown> = {
          page: args.page,
          rowCount: args.row_count,
        };
        if (args.start || args.end) {
          blacklist.filter = {
            ...(args.start ? { start: args.start } : {}),
            ...(args.end ? { end: args.end } : {}),
          };
        }
        return call(
          "/get-blacklist/json",
          { blacklist },
          summarizeBlacklist,
          docUrl("get-blacklist"),
        );
      },
    },
    {
      name: "add_blacklist",
      config: {
        title: "Add to blacklist",
        description:
          "Block a number so it stops receiving SMS. Idempotent — re-adding returns success. " +
          `Reference: ${docUrl("add-blacklist")}`,
        inputSchema: blacklistNumberShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof blacklistNumberShape>;
        return call(
          "/add-blacklist/json",
          { blacklist: { number: args.number } },
          undefined,
          docUrl("add-blacklist"),
        );
      },
    },
    {
      name: "delete_blacklist",
      config: {
        title: "Remove from blacklist",
        description:
          "Unblock a number. Returns an error if the number is not currently on the blacklist. " +
          `Reference: ${docUrl("delete-blacklist")}`,
        inputSchema: blacklistNumberShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof blacklistNumberShape>;
        return call(
          "/delete-blacklist/json",
          { blacklist: { number: args.number } },
          undefined,
          docUrl("delete-blacklist"),
        );
      },
    },
    {
      name: "iys_register",
      config: {
        title: "Register İYS consent",
        description:
          "Register İYS (İleti Yönetim Sistemi) consent records in batch (1–5000, processed " +
          "atomically — one failure fails the whole batch). Required for commercial messaging in " +
          "Turkey under Law 6563. Each consent_date must be no older than 3 days. " +
          `Reference: ${DOCS_API}`,
        inputSchema: iysRegisterShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof iysRegisterShape>;
        const list = args.consents.map((c) => ({
          recipient: c.recipient,
          recipientType: c.recipient_type,
          type: c.type,
          status: c.status,
          source: c.source,
          consentDate: c.consent_date,
        }));
        return call(
          "/consent/create/json",
          { consent: { brandCode: args.brand_code, list } },
          undefined,
          DOCS_API,
        );
      },
    },
    {
      name: "iys_check",
      config: {
        title: "Check İYS consent",
        description:
          "Look up a single recipient's İYS consent status (ONAY / RET) for a brand + channel. " +
          `Reference: ${DOCS_API}`,
        inputSchema: iysCheckShape,
      },
      handler: async (raw) => {
        const args = raw as ArgsOf<typeof iysCheckShape>;
        return call(
          "/consent/show/json",
          {
            consent: {
              brandCode: args.brand_code,
              recipient: args.recipient,
              recipientType: args.recipient_type,
              type: args.type,
            },
          },
          undefined,
          DOCS_API,
        );
      },
    },
  ];
}
