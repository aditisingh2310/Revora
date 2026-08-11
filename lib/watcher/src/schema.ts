import { sqliteTable, text, integer, json, index } from "drizzle-orm/sqlite-core";

export const watchersTable = sqliteTable("watchers", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url"),
  config: text("config").notNull(),
  intervalSeconds: integer("interval_seconds").notNull().$default(900),
  aiAction: text("ai_action").notNull().$default("notify"),
  aiPrompt: text("ai_prompt"),
  enabled: integer("enabled").notNull().$default(1),
  lastCheckedAt: text("last_checked_at"),
  nextCheckAt: text("next_check_at"),
  lastStatus: text("last_status"),
  errorCount: integer("error_count").notNull().$default(0),
  totalChecks: integer("total_checks").notNull().$default(0),
  totalChanges: integer("total_changes").notNull().$default(0),
  lastDurationMs: integer("last_duration_ms"),
  lastError: text("last_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  organizationIdx: index("watchers_organization_idx").on(table.organizationId),
}));

export const watcherSnapshotsTable = sqliteTable("watcher_snapshots", {
  id: text("id").primaryKey(),
  watcherId: text("watcher_id").notNull(),
  contentHash: text("content_hash"),
  content: text("content"),
  priceValue: integer("price_value"),
  metadata: text("metadata").notNull().$default("{}"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  watcherIdx: index("watcher_snapshots_watcher_idx").on(table.watcherId),
}));

export const watcherEventsTable = sqliteTable("watcher_events", {
  id: text("id").primaryKey(),
  watcherId: text("watcher_id").notNull(),
  eventType: text("event_type").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changeSummary: text("change_summary"),
  severity: text("severity").notNull().$default("info"),
  notified: integer("notified").notNull().$default(0),
  acknowledged: integer("acknowledged").notNull().$default(0),
  aiAnalyzed: integer("ai_analyzed").notNull().$default(0),
  aiSummary: text("ai_summary"),
  confidence: integer("confidence").notNull().$default(1),
  changePercent: integer("change_percent"),
  suppressed: integer("suppressed").notNull().$default(0),
  suppressionReason: text("suppression_reason"),
  feedback: text("feedback"),
  feedbackNote: text("feedback_note"),
  createdAt: text("created_at").notNull(),
}, (table) => ({
  watcherIdx: index("watcher_events_watcher_idx").on(table.watcherId),
  notifiedIdx: index("watcher_events_notified_idx").on(table.notified),
}));

export const watcherNotificationsTable = sqliteTable("watcher_notifications", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  channel: text("channel").notNull(),
  status: text("status").notNull().$default("pending"),
  attempts: integer("attempts").notNull().$default(0),
  nextRetryAt: text("next_retry_at"),
  sentAt: text("sent_at"),
  error: text("error"),
}, (table) => ({
  eventIdx: index("watcher_notifications_event_idx").on(table.eventId),
}));

export const watcherCheckRunsTable = sqliteTable("watcher_check_runs", {
  id: text("id").primaryKey(),
  watcherId: text("watcher_id").notNull(),
  status: text("status").notNull(),
  startedAt: text("started_at").notNull(),
  finishedAt: text("finished_at").notNull(),
  durationMs: integer("duration_ms").notNull(),
  changed: integer("changed").notNull().$default(0),
  httpStatus: integer("http_status"),
  bytesReceived: integer("bytes_received").notNull().$default(0),
  error: text("error"),
}, (table) => ({
  watcherIdx: index("watcher_check_runs_watcher_idx").on(table.watcherId),
}));
