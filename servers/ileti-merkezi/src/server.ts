/**
 * İletiMerkezi MCP server factory.
 *
 * 11 tools defined inline, all hitting the real v1 JSON API
 * (POST /<action>/json with a `request` envelope).
 */

import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
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

export const logger = createLogger("ileti-merkezi-mcp");

export const TOOL_COUNT = 11;

/** Single source of truth for the advertised version — no hardcoded drift. */
export const VERSION = (
  JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    version: string;
  }
).version;

const DOCS_API = "https://www.iletimerkezi.com/en/docs/api";
const docUrl = (slug: string) => `https://www.iletimerkezi.com/docs/api/${slug}`;

type Summarizer = (body: unknown) => string | null;

/**
 * Lazy module-level client — does not throw at construction without env vars,
 * so the server boots and lists tools even when unconfigured.
 */
const client = new IletiMerkeziClient();

function textResult(text: string, isError: boolean): CallToolResult {
  return { isError, content: [{ type: "text", text }] };
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
    `${ok ? "OK" : "FAILED"} ${path} (HTTP ${api.status}` +
    `${apiCode !== null ? `, response.status.code ${apiCode}` : ""})` +
    `${apiMsg ? ` — ${apiMsg}` : ""}.`;

  const highlights = ok && summarize ? summarize(api.body) : null;
  const guidance = ok ? "" : guidanceFor(apiCode, reference);
  const raw = "```json\n" + JSON.stringify(api.body, null, 2) + "\n```";

  const text = [head, highlights, guidance, `Request URL: ${api.requestUrl}`, raw]
    .filter(Boolean)
    .join("\n\n");
  return textResult(text, !ok);
}

async function call(
  path: string,
  input: Record<string, unknown>,
  summarize: Summarizer | undefined,
  reference: string,
): Promise<CallToolResult> {
  return render(path, await client.call(path, input), summarize, reference);
}

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ileti-merkezi-mcp",
    version: VERSION,
  });

  server.tool(
    "send_sms",
    "Send an SMS to one recipient or many (bulk, up to 50000) via İletiMerkezi. " +
      "Single and bulk use the same call — pass `to` as a string or an array. " +
      "For OTP/one-time codes, send to a single recipient with message_type=transactional. " +
      "İYS (Turkey commercial-message consent): set message_type=commercial for any marketing " +
      "content (enables real-time consent validation); transactional messages are exempt. " +
      `Reference: ${docUrl("send-sms")}`,
    sendSmsShape,
    withErrorHandling(async (params) => {
      const numbers = Array.isArray(params.to) ? params.to : [params.to];
      const sender =
        params.sender ?? process.env["ILETIMERKEZI_SENDER"] ?? process.env["ILETI_SENDER"];
      if (!sender) {
        return textResult(
          "No sender header provided. Pass `sender` (3-11 chars, panel-approved; " +
            "use APITEST for sandbox) or set ILETIMERKEZI_SENDER in your MCP config.",
          true,
        );
      }
      const iys = params.iys ?? (params.message_type === "commercial" ? "1" : "0");
      const order = {
        sender,
        sendDateTime: params.schedule_at ?? "",
        iys,
        iysList: params.iys_list,
        message: { text: params.message, receipents: { number: numbers } },
      };
      return call("/send-sms/json", { order }, summarizeSend, docUrl("send-sms"));
    }),
  );

  server.tool(
    "cancel_order",
    "Cancel a future-scheduled SMS order before it is dispatched. " +
      `Reference: ${docUrl("cancel-order")}`,
    cancelOrderShape,
    withErrorHandling(async (params) =>
      call(
        "/cancel-order/json",
        { order: { id: params.order_id } },
        summarizeCancel,
        docUrl("cancel-order"),
      ),
    ),
  );

  server.tool(
    "get_report",
    "Get the per-recipient delivery report for one order id (status counts + each number's " +
      "delivery state). Order status: 113 SENDING / 114 COMPLETED / 115 CANCELED. " +
      "Message status: 110 WAITING / 111 DELIVERED / 112 UNDELIVERED. " +
      `Reference: ${docUrl("get-report")}`,
    getReportShape,
    withErrorHandling(async (params) =>
      call(
        "/get-report/json",
        { order: { id: params.order_id, page: params.page, rowCount: params.row_count } },
        summarizeReport,
        docUrl("get-report"),
      ),
    ),
  );

  server.tool(
    "get_reports",
    "List order summaries within a date range (YYYY-MM-DD, range no wider than 10 days). " +
      `Reference: ${docUrl("get-reports")}`,
    getReportsShape,
    withErrorHandling(async (params) =>
      call(
        "/get-reports/json",
        { filter: { start: params.start, end: params.end, page: params.page } },
        undefined,
        docUrl("get-reports"),
      ),
    ),
  );

  server.tool(
    "get_balance",
    "Get account balance (TL) and remaining SMS credits. Side-effect free, costs nothing. " +
      `Reference: ${docUrl("get-balance")}`,
    emptyShape,
    withErrorHandling(async () =>
      call("/get-balance/json", {}, summarizeBalance, docUrl("get-balance")),
    ),
  );

  server.tool(
    "get_sender",
    "List the approved sender headers (başlık) on the account. A header must be BTK-approved " +
      "before it can be used; APITEST is available as a sandbox sender. " +
      `Reference: ${docUrl("get-sender")}`,
    emptyShape,
    withErrorHandling(async () =>
      call("/get-sender/json", {}, summarizeSenders, docUrl("get-sender")),
    ),
  );

  server.tool(
    "get_blacklist",
    "List blocked numbers (paginated), optionally filtered by a datetime range " +
      "(YYYY-MM-DD HH:MM:SS). " +
      `Reference: ${docUrl("get-blacklist")}`,
    getBlacklistShape,
    withErrorHandling(async (params) => {
      const blacklist: Record<string, unknown> = {
        page: params.page,
        rowCount: params.row_count,
      };
      if (params.start || params.end) {
        blacklist.filter = {
          ...(params.start ? { start: params.start } : {}),
          ...(params.end ? { end: params.end } : {}),
        };
      }
      return call("/get-blacklist/json", { blacklist }, summarizeBlacklist, docUrl("get-blacklist"));
    }),
  );

  server.tool(
    "add_blacklist",
    "Block a number so it stops receiving SMS. Idempotent — re-adding returns success. " +
      `Reference: ${docUrl("add-blacklist")}`,
    blacklistNumberShape,
    withErrorHandling(async (params) =>
      call(
        "/add-blacklist/json",
        { blacklist: { number: params.number } },
        undefined,
        docUrl("add-blacklist"),
      ),
    ),
  );

  server.tool(
    "delete_blacklist",
    "Unblock a number. Returns an error if the number is not currently on the blacklist. " +
      `Reference: ${docUrl("delete-blacklist")}`,
    blacklistNumberShape,
    withErrorHandling(async (params) =>
      call(
        "/delete-blacklist/json",
        { blacklist: { number: params.number } },
        undefined,
        docUrl("delete-blacklist"),
      ),
    ),
  );

  server.tool(
    "iys_register",
    "Register İYS (İleti Yönetim Sistemi) consent records in batch (1-5000, processed " +
      "atomically — one failure fails the whole batch). Required for commercial messaging in " +
      "Turkey under Law 6563. Each consent_date must be no older than 3 days. " +
      `Reference: ${DOCS_API}`,
    iysRegisterShape,
    withErrorHandling(async (params) => {
      const list = params.consents.map((c) => ({
        recipient: c.recipient,
        recipientType: c.recipient_type,
        type: c.type,
        status: c.status,
        source: c.source,
        consentDate: c.consent_date,
      }));
      return call(
        "/consent/create/json",
        { consent: { brandCode: params.brand_code, list } },
        undefined,
        DOCS_API,
      );
    }),
  );

  server.tool(
    "iys_check",
    "Look up a single recipient's İYS consent status (ONAY / RET) for a brand + channel. " +
      `Reference: ${DOCS_API}`,
    iysCheckShape,
    withErrorHandling(async (params) =>
      call(
        "/consent/show/json",
        {
          consent: {
            brandCode: params.brand_code,
            recipient: params.recipient,
            recipientType: params.recipient_type,
            type: params.type,
          },
        },
        undefined,
        DOCS_API,
      ),
    ),
  );

  return server;
}

/** Reset module-level client cache — used by tests to force re-read of env vars. */
export function resetTestClient(): void {
  client.reset();
}
