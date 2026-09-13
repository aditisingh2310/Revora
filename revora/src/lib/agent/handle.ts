import { createSupabaseClient } from "@/lib/comms/db/supabase";
import { insertMessage } from "@/lib/comms/db/repositories/messages";
import { TelegramAdapter } from "@/lib/comms/channels/telegram/adapter";
import { resolveOrganizationId } from "@/lib/tenant";
import { runAgent, decideReply } from "./runner";
import type { NormalizedMessage } from "@/lib/comms/types/messages";

const adapter = new TelegramAdapter();
const lastCall = new Map<string, number>();

const FALLBACK_REPLY =
  "My smart brain is unreachable right now, but I got your message and saved it. Try asking about orders or sales again in a bit, or type /start — a human will follow up soon!";

export function isThrottled(key: string, now = Date.now()): boolean {
  const prev = lastCall.get(key) ?? 0;
  if (now - prev < 12_000) return true;
  lastCall.set(key, now);
  return false;
}

export async function handleIncomingForAgent(
  message: NormalizedMessage,
  contactId: string,
): Promise<void> {
  try {
    if (process.env.AGENT_ENABLED !== "true") return;
    if (!message.text) return;
    const gate = decideReply({ text: message.text, isDuplicate: false });
    if (!gate.shouldReply) return;
    const throttleKey = `${message.channelConnectionId}:${message.externalUserId}`;
    if (isThrottled(throttleKey)) return;

    const organizationId = await resolveOrganizationId(new Request("http://local/agent"));
    // The bot must never go silent: if the LLM call blows up (bad key,
    // provider outage, policy block), fall back to a friendly reply.
    let replyText: string;
    try {
      const result = await runAgent({ text: message.text, organizationId });
      if (!result.shouldReply || !result.text) return;
      replyText = result.text;
    } catch (err) {
      console.error("agent LLM failed, using fallback reply", err);
      replyText = FALLBACK_REPLY;
    }

    const chatId = String(
      (message.metadata as Record<string, unknown>).telegramChatId ??
        message.externalUserId,
    );
    const client = createSupabaseClient();
    const botToken = process.env.TELEGRAM_BOT_TOKEN as string | undefined;
    const send = await adapter.sendMessage(
      { to: chatId, text: replyText },
      {
        shopId: message.shopId,
        inboxId: message.inboxId ?? null,
        channelConnectionId: message.channelConnectionId,
        botToken,
      },
    );
    if (!send.ok || !client) {
      console.error("agent reply send failed", send);
      return;
    }
    await insertMessage(client, {
      shopId: message.shopId,
      inboxId: message.inboxId ?? null,
      contactId,
      channelConnectionId: message.channelConnectionId,
      externalMessageId: send.externalMessageId ?? `out-${Date.now()}`,
      channel: "telegram",
      direction: "outgoing",
      messageType: "text",
      text: replyText,
      metadata: { replyTo: message.externalMessageId },
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("agent handle failed", err);
  }
}
