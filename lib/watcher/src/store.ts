import { db } from "@workspace/db";
import { eq } from "drizzle-orm";
import { watchersTable, watcherSnapshotsTable, watcherEventsTable, watcherNotificationsTable, watcherCheckRunsTable } from "./schema";
import type { WatcherRecord, SnapshotRecord, EventRecord, NotificationRecord, CheckRunRecord } from "./models";

export class WatcherStore {
  async listWatchers(organizationId: string) {
    return db.select().from(watchersTable).where(eq(watchersTable.organizationId, organizationId));
  }

  async getWatcher(id: string, organizationId: string) {
    const [record] = await db.select().from(watchersTable).where(eq(watchersTable.id, id), eq(watchersTable.organizationId, organizationId)).limit(1);
    return record;
  }

  async insertSnapshot(snapshot: SnapshotRecord) {
    await db.insert(watcherSnapshotsTable).values(snapshot);
  }

  async getLatestSnapshot(watcherId: string) {
    const [record] = await db
      .select()
      .from(watcherSnapshotsTable)
      .where(eq(watcherSnapshotsTable.watcherId, watcherId))
      .orderBy(watcherSnapshotsTable.createdAt.desc)
      .limit(1);
    return record;
  }

  async insertEvent(event: EventRecord) {
    await db.insert(watcherEventsTable).values(event);
  }

  async getUnnotifiedEvents(limit = 100) {
    return db
      .select()
      .from(watcherEventsTable)
      .where(eq(watcherEventsTable.notified, 0))
      .orderBy(watcherEventsTable.createdAt.asc)
      .limit(limit);
  }

  async markEventNotified(eventId: string) {
    await db.update(watcherEventsTable).set({ notified: 1 }).where(eq(watcherEventsTable.id, eventId));
  }

  async insertNotification(notification: NotificationRecord) {
    await db.insert(watcherNotificationsTable).values(notification);
  }

  async updateNotification(notification: NotificationRecord) {
    await db.update(watcherNotificationsTable).set(notification).where(eq(watcherNotificationsTable.id, notification.id));
  }

  async insertCheckRun(checkRun: CheckRunRecord) {
    await db.insert(watcherCheckRunsTable).values(checkRun);
  }
}
