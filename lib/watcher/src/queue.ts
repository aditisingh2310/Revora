import { WatcherStore } from "./store";
import type { EventRecord } from "./models";

export class EventQueue {
  constructor(private readonly store = new WatcherStore()) {}

  async addEvent(event: EventRecord) {
    await this.store.insertEvent(event);
  }

  async getUnnotifiedEvents(limit = 100) {
    return this.store.getUnnotifiedEvents(limit);
  }

  async markNotified(eventId: string) {
    await this.store.markEventNotified(eventId);
  }
}
