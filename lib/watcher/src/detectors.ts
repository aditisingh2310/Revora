export interface DetectionResult {
  changed: boolean;
  oldValue: string | null;
  newValue: string | null;
  summary: string | null;
  severity: string;
}

export function canonicalize(value: unknown, ignorePatterns: string[] | undefined): string {
  const payload = typeof value === "string" ? value : JSON.stringify(value, null, 0);
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return payload;
  }
  return ignorePatterns.reduce((current, pattern) => {
    try {
      return current.replace(new RegExp(pattern, "g"), "");
    } catch {
      return current;
    }
  }, payload);
}

export class HashDetector {
  detect(previous: string | null, current: string | null, ignorePatterns?: string[]): DetectionResult {
    const previousText = canonicalize(previous ?? "", ignorePatterns);
    const currentText = canonicalize(current ?? "", ignorePatterns);
    const same = previousText === currentText;
    return {
      changed: !same,
      oldValue: same ? null : previousText.slice(0, 2000),
      newValue: same ? null : currentText.slice(0, 2000),
      summary: same ? null : "Content hash changed",
      severity: same ? "info" : "warning",
    };
  }
}

export class DiffDetector {
  detect(previous: string | null, current: string | null, ignorePatterns?: string[]): DetectionResult {
    const previousText = canonicalize(previous ?? "", ignorePatterns);
    const currentText = canonicalize(current ?? "", ignorePatterns);
    if (previousText === currentText) {
      return { changed: false, oldValue: null, newValue: null, summary: null, severity: "info" };
    }
    const summary = `Content changed: ${Math.max(previousText.length, currentText.length)} chars evaluated.`;
    return {
      changed: true,
      oldValue: previousText.slice(0, 2000),
      newValue: currentText.slice(0, 2000),
      summary,
      severity: "warning",
    };
  }
}

export class ThresholdDetector {
  detect(previous: number | null, current: number | null, thresholds: Record<string, unknown> | null): DetectionResult {
    if (previous === null || current === null) {
      return { changed: false, oldValue: null, newValue: null, summary: null, severity: "info" };
    }
    const delta = current - previous;
    const summary = `Value changed from ${previous} to ${current} (${delta >= 0 ? "+" : ""}${delta}).`;
    const severity = Math.abs(delta) >= Number(thresholds?.value ?? 0) ? "critical" : "warning";
    return {
      changed: delta !== 0,
      oldValue: String(previous),
      newValue: String(current),
      summary: delta === 0 ? null : summary,
      severity,
    };
  }
}
