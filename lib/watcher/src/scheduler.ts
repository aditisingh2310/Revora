import { randomUUID } from "crypto";
import { WatcherStore } from "./store";
import { EventQueue } from "./queue";
import { NotificationDispatcher } from "./notifier";
import { AIAnalyzer } from "./ai-analyzer";
import { HashDetector, DiffDetector, ThresholdDetector, canonicalize } from "./detectors";
import type { FetchResult } from "./fetchers/base";
import { defaultFetchers } from "./fetchers";
import type { EventRecord, SnapshotRecord, WatcherRecord } from "./models";

export type EventCallback = (eventType: string, payload: Record<string, unknown>) => Promise<void> | void;

export class WatcherScheduler {
  private readonly store = new WatcherStore();
  private readonly queue = new EventQueue(this.store);
  private readonly notifier = new NotificationDispatcher(this.store);
  private readonly analyzer = new AIAnalyzer();

  constructor(private readonly fetchers = defaultFetchers, private readonly onEvent?: EventCallback) {}

  async checkWatcher(watcher: WatcherRecord, force = false): Promise<EventRecord | null> {
    if (!watcher.enabled) return null;
    const now = new Date();
    if (!force && watcher.nextCheckAt && new Date(watcher.nextCheckAt) > now) {
      return null;
    }
    const fetcher = this.fetchers[watcher.type];
    if (!fetcher) {
      return null;
    }
    const result = await fetcher.fetch(watcher.url ?? "", watcher.config as Record<string, unknown>);
    if (!result.success) {
      return null;
    }
    return this.processSuccess(watcher, result);
  }

  private async processSuccess(watcher: WatcherRecord, result: FetchResult): Promise<EventRecord | null> {
    const previousSnapshot = await this.store.getLatestSnapshot(watcher.id);
    const content = typeof result.content === "string" ? result.content : JSON.stringify(result.content);
    const snapshot: SnapshotRecord = {
      id: randomUUID(),
      watcherId: watcher.id,
      contentHash: this.hashContent(content, watcher.config.ignorePatterns as string[] | undefined),
      content,
      priceValue: this.numericValue(result.content, watcher),
      metadata: JSON.stringify({ ...result.metadata }),
      createdAt: new Date().toISOString(),
    };
    await this.store.insertSnapshot(snapshot);
    const event = this.detectEvent(watcher, previousSnapshot, snapshot);
    if (event) {
      await this.store.insertEvent(event);
      const analysis = await this.analyzer.analyze(event, watcher);
      if (analysis) {
        event.aiAnalyzed = 1;
        event.aiSummary = analysis;
        await this.store.insertEvent(event);
      }
      if (!event.suppressed) {
        await this.notifier.dispatch(event, watcher);
      }
      this.onEvent?.("watcher.event", { watcher: watcher.id, event: event.id });
    }
    return event;
  }

  private detectEvent(watcher: WatcherRecord, previous: SnapshotRecord | undefined, current: SnapshotRecord): EventRecord | null {
    if (!previous) {
      return null;
    }
    const contentChanged = this.detectContentChange(previous, current, watcher);
    if (!contentChanged.changed) {
      return null;
    }
    return {
      id: randomUUID(),
      watcherId: watcher.id,
      eventType: contentChanged.eventType,
      oldValue: contentChanged.oldValue,
      newValue: contentChanged.newValue,
      changeSummary: contentChanged.summary,
      severity: contentChanged.severity,
      notified: 0,
      acknowledged: 0,
      aiAnalyzed: 0,
      aiSummary: null,
      confidence: 1,
      changePercent: null,
      suppressed: 0,
      suppressionReason: null,
      feedback: null,
      feedbackNote: null,
      createdAt: new Date().toISOString(),
    };
  }

  private detectContentChange(previous: SnapshotRecord, current: SnapshotRecord, watcher: WatcherRecord) {
    const previousText = canonicalize(previous.content, watcher.config.ignorePatterns as string[] | undefined);
    const currentText = canonicalize(current.content, watcher.config.ignorePatterns as string[] | undefined);
    if (previousText === currentText) {
      return { changed: false, oldValue: null, newValue: null, summary: null, severity: "info", eventType: "content_unchanged" };
    }
    const threshold = new ThresholdDetector();
    const thresholdResult = threshold.detect(previous.priceValue, current.priceValue, watcher.config.alertPolicy as Record<string, unknown> | null);
    if (thresholdResult.changed) {
      return { ...thresholdResult, eventType: "threshold_change" };
    }
    const diff = new DiffDetector().detect(previous.content, current.content, watcher.config.ignorePatterns as string[] | undefined);
    if (diff.changed) {
      return { ...diff, eventType: "content_change" };
    }
    const hash = new HashDetector().detect(previous.content, current.content, watcher.config.ignorePatterns as string[] | undefined);
    return { ...hash, eventType: "content_change" };
  }

  private hashContent(content: string, ignorePatterns?: string[]) {
    const normalized = canonicalize(content, ignorePatterns);
    return crypto.createHash("sha256").update(normalized).digest("hex");
  }

  private numericValue(content: unknown, watcher: WatcherRecord): number | null {
    if (typeof content === "object" && content !== null) {
      const price = (content as Record<string, unknown>)["price"] ?? (content as Record<string, unknown>)[watcher.config?.thresholdField as string];
      if (typeof price === "number") {
        return price;
      }
    }
    return null;
  }
}
