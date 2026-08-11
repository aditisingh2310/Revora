export type WatcherType = "website" | "custom";

export type WatcherAction = "notify" | "suggest" | "auto";

export interface WatcherConfig {
  timeout?: number;
  ignorePatterns?: string[];
  baseline?: unknown;
  alertPolicy?: Record<string, unknown>;
  notifications?: Record<string, unknown>;
  autoAction?: Record<string, unknown>;
}

export interface WatcherRecord {
  id: string;
  organizationId: string;
  name: string;
  type: WatcherType;
  url: string | null;
  config: WatcherConfig;
  intervalSeconds: number;
  aiAction: WatcherAction;
  aiPrompt: string | null;
  enabled: boolean;
  lastCheckedAt: string | null;
  nextCheckAt: string | null;
  lastStatus: string | null;
  errorCount: number;
  totalChecks: number;
  totalChanges: number;
  lastDurationMs: number | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SnapshotRecord {
  id: string;
  watcherId: string;
  contentHash: string | null;
  content: string | null;
  priceValue: number | null;
  metadata: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  watcherId: string;
  eventType: string;
  oldValue: string | null;
  newValue: string | null;
  changeSummary: string | null;
  severity: string;
  notified: number;
  acknowledged: number;
  aiAnalyzed: number;
  aiSummary: string | null;
  confidence: number;
  changePercent: number | null;
  suppressed: number;
  suppressionReason: string | null;
  feedback: string | null;
  feedbackNote: string | null;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  eventId: string;
  channel: string;
  status: string;
  attempts: number;
  nextRetryAt: string | null;
  sentAt: string | null;
  error: string | null;
}

export interface CheckRunRecord {
  id: string;
  watcherId: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  changed: number;
  httpStatus: number | null;
  bytesReceived: number;
  error: string | null;
}
