import { createSupabaseClient } from "@/lib/comms/db/supabase";
import { insertMessage } from "@/lib/comms/db/repositories/messages";
import { TelegramAdapter } from "@/lib/comms/channels/telegram/adapter";
import { resolveOrganizationId } from "@/lib/tenant";
import { runAgent, decideReply, AGENT_FALLBACK_MODEL_ID } from "./runner";
import type { NormalizedMessage } from "@/lib/comms/types/messages";

const adapter = new TelegramAdapter();
const lastCall = new Map<string, number>();

// AGENTS.md §2: no canned fallback text. On LLM failure retry once with the
// fallback free model, then stay silent (log only). Never send hardcoded text.

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
    let replyText: string | null = null;
    try {
      const result = await runAgent({ text: message.text, organizationId });
      if (!result.shouldReply || !result.text) return;
      replyText = result.text;
    } catch (err) {
      console.error("agent LLM failed, retrying with fallback model", err);
      try {
        const retry = await runAgent({
          text: message.text,
          organizationId,
          modelId: AGENT_FALLBACK_MODEL_ID,
        });
        if (!retry.shouldReply || !retry.text) return;
        replyText = retry.text;
      } catch (retryErr) {
        console.error("agent fallback LLM also failed, staying silent", retryErr);
        return;
      }
    }
    if (!replyText) return;

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
    console.log("agent reply sent", {
      chatId,
      replyChars: replyText.length,
      replyTo: message.externalMessageId,
    });
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
