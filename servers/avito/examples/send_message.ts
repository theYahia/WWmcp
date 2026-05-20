/**
 * examples/send_message.ts — end-to-end demo: pick the first chat with unread
 * messages, then send a canned reply.
 *
 * Run (requires real Avito OAuth credentials):
 *   AVITO_CLIENT_ID=... AVITO_CLIENT_SECRET=... AVITO_USER_ID=... \
 *     tsx servers/avito/examples/send_message.ts
 *
 * The script never spams — it sends one short message to the first unread
 * chat and exits. Comment out the send_message call to do a dry run.
 */

import { handleListChats } from "../src/tools/list-chats.js";
import { handleSendMessage } from "../src/tools/send-message.js";

const REPLY = "Здравствуйте! Получил ваше сообщение, отвечу подробнее в течение часа.";

async function main(): Promise<void> {
  if (!process.env["AVITO_CLIENT_ID"] || !process.env["AVITO_CLIENT_SECRET"]) {
    console.error(
      "Set AVITO_CLIENT_ID + AVITO_CLIENT_SECRET (+ optionally AVITO_USER_ID) before running.",
    );
    process.exit(1);
  }

  console.error("→ Fetching unread chats...");
  const chatsJson = JSON.parse(
    await handleListChats({
      limit: 5,
      offset: 0,
      unread_only: true,
    }),
  ) as { chats?: Array<{ id: string; users?: unknown[] }> };

  const chats = chatsJson.chats ?? [];
  if (chats.length === 0) {
    console.error("No unread chats — nothing to reply to. Exiting.");
    return;
  }

  const target = chats[0];
  console.error(`→ Replying to chat_id=${target.id} with canned message...`);

  const sendResult = await handleSendMessage({
    chat_id: target.id,
    text: REPLY,
  });
  console.error("→ Send result:");
  console.log(sendResult);
}

main().catch((err: unknown) => {
  console.error(
    "send_message demo failed:",
    err instanceof Error ? err.message : String(err),
  );
  process.exit(1);
});
