import type { EventRecord, NotificationRecord, WatcherRecord } from "./models";
import { WatcherStore } from "./store";

export class NotificationDispatcher {
  constructor(private readonly store = new WatcherStore(), private readonly settings: Record<string, unknown> = {}) {}

  async dispatch(event: EventRecord, watcher: WatcherRecord): Promise<void> {
    const config = this.mergedConfig(watcher);
    const channels = Object.keys(config).filter((key) => (config[key] as Record<string, unknown>)?.enabled);
    if (channels.length === 0) {
      await this.store.markEventNotified(event.id);
      return;
    }
    await Promise.all(channels.map((channel) => this.sendChannel(channel, event, watcher, config[channel] as Record<string, unknown>)));
  }

  private mergedConfig(watcher: WatcherRecord): Record<string, Record<string, unknown>> {
    return { ...this.settings, ...(watcher.config.notifications as Record<string, Record<string, unknown>> ?? {}) };
  }

  private async sendChannel(channel: string, event: EventRecord, watcher: WatcherRecord, config: Record<string, unknown>): Promise<void> {
    const notification: NotificationRecord = {
      id: crypto.randomUUID(),
      eventId: event.id,
      channel,
      status: "pending",
      attempts: 0,
      nextRetryAt: null,
      sentAt: null,
      error: null,
    };
    await this.store.insertNotification(notification);
    try {
      if (channel === "webhook") {
        await this.sendWebhook(event, watcher, config);
      } else {
        throw new Error(`Unsupported notification channel: ${channel}`);
      }
      notification.status = "sent";
      notification.sentAt = new Date().toISOString();
    } catch (error) {
      notification.status = "failed";
      notification.error = error instanceof Error ? error.message : String(error);
      notification.attempts += 1;
      notification.nextRetryAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
    }
    await this.store.updateNotification(notification);
    if (notification.status === "sent") {
      await this.store.markEventNotified(event.id);
    }
  }

  private async sendWebhook(event: EventRecord, watcher: WatcherRecord, config: Record<string, unknown>): Promise<void> {
    const url = String(config.url ?? "");
    if (!url) {
      throw new Error("Webhook channel requires url");
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ watcher, event }),
    });
    if (!response.ok) {
      throw new Error(`Webhook delivery failed with ${response.status}`);
    }
  }
}
