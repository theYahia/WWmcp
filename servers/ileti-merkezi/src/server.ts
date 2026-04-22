/**
 * Ileti Merkezi MCP server factory.
 *
 * 8 tools defined inline (no separate tools/* files in v1, kept that way).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createLogger, withErrorHandling } from "@theyahia/mcp-core";
import { IletiMerkeziClient } from "./client.js";

export const logger = createLogger("ileti-merkezi-mcp");

export const TOOL_COUNT = 8;

/**
 * Lazy module-level client — does not throw at construction without env vars.
 * Tools share this instance to amortize the singleton inside IletiMerkeziClient.
 */
const client = new IletiMerkeziClient();

export function createServer(): McpServer {
  const server = new McpServer({
    name: "ileti-merkezi-mcp",
    version: "2.0.0",
  });

  server.tool(
    "send_sms",
    "Send a single SMS via Ileti Merkezi (Turkey). Recipient phone in international E.164 format (+90...).",
    {
      to: z.string().describe("Recipient phone number with country code (e.g. +905551234567)"),
      message: z.string().describe("SMS message text"),
      sender: z.string().optional().describe("Sender name/number (must be pre-approved at Ileti Merkezi panel)"),
      schedule_at: z.string().optional().describe("Schedule send time (ISO 8601). Omit to send immediately."),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = { to: params.to, message: params.message };
      if (params.sender) body.sender = params.sender;
      if (params.schedule_at) body.scheduleAt = params.schedule_at;
      const result = await client.request("POST", "/send-sms", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "send_bulk_sms",
    "Send the same SMS to multiple recipients (Turkey). All numbers must be in E.164 format.",
    {
      recipients: z.array(z.string()).describe("Array of phone numbers"),
      message: z.string().describe("SMS message text"),
      sender: z.string().optional().describe("Sender name (must be pre-approved)"),
      schedule_at: z.string().optional().describe("Schedule send time (ISO 8601)"),
    },
    withErrorHandling(async (params) => {
      const body: Record<string, unknown> = {
        recipients: params.recipients,
        message: params.message,
      };
      if (params.sender) body.sender = params.sender;
      if (params.schedule_at) body.scheduleAt = params.schedule_at;
      const result = await client.request("POST", "/send-bulk-sms", body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_sms_report",
    "Get delivery report for a previously sent SMS by message_id (single SMS) or order_id (bulk SMS).",
    {
      message_id: z.string().optional().describe("Message ID to look up (from send_sms response)"),
      order_id: z.string().optional().describe("Order ID for bulk SMS (from send_bulk_sms response)"),
      page: z.number().int().default(1).describe("Page number"),
      per_page: z.number().int().default(25).describe("Items per page"),
    },
    withErrorHandling(async (params) => {
      const qs = new URLSearchParams({
        page: String(params.page),
        perPage: String(params.per_page),
      });
      if (params.message_id) qs.set("messageId", params.message_id);
      if (params.order_id) qs.set("orderId", params.order_id);
      const result = await client.request("GET", `/reports?${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_balance",
    "Get current account balance and remaining SMS credits.",
    {},
    withErrorHandling(async () => {
      const result = await client.request("GET", "/balance");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "list_senders",
    "List approved sender names/numbers configured for the account.",
    {},
    withErrorHandling(async () => {
      const result = await client.request("GET", "/senders");
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "create_contact_group",
    "Create a new contact group for organizing recipients.",
    {
      name: z.string().describe("Group name"),
    },
    withErrorHandling(async (params) => {
      const result = await client.request("POST", "/contacts/groups", { name: params.name });
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "add_contacts",
    "Add one or more contacts (phone + optional name/email) to an existing contact group.",
    {
      group_id: z.string().describe("Contact group ID"),
      contacts: z
        .array(
          z.object({
            phone_number: z.string().describe("Phone number with country code (E.164)"),
            name: z.string().optional().describe("First name"),
            surname: z.string().optional().describe("Last name"),
            email: z.string().optional().describe("Email address"),
          }),
        )
        .describe("Contacts to add"),
    },
    withErrorHandling(async (params) => {
      const body = {
        contacts: params.contacts.map((c) => ({
          phoneNumber: c.phone_number,
          name: c.name,
          surname: c.surname,
          email: c.email,
        })),
      };
      const result = await client.request("POST", `/contacts/groups/${params.group_id}/contacts`, body);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  server.tool(
    "get_blacklist",
    "Get the list of blacklisted phone numbers (numbers that opted out or were blocked).",
    {
      page: z.number().int().default(1).describe("Page number"),
      per_page: z.number().int().default(25).describe("Items per page"),
    },
    withErrorHandling(async (params) => {
      const qs = new URLSearchParams({
        page: String(params.page),
        perPage: String(params.per_page),
      });
      const result = await client.request("GET", `/blacklist?${qs}`);
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    }),
  );

  return server;
}

/** Reset module-level client cache — used by tests to force re-read of env vars. */
export function resetTestClient(): void {
  client.reset();
}
