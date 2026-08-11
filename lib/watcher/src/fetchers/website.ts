import { FetchResult, BaseFetcher, validateTargetUrl } from "./base";

export class WebsiteFetcher extends BaseFetcher {
  async fetch(target: string, config?: Record<string, unknown>): Promise<FetchResult> {
    const url = validateTargetUrl(target, Boolean(config?.allowPrivateNetwork));
    const controller = new AbortController();
    const timeout = Number(config?.timeout ?? 15_000);
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent": "Revora-Watcher/1.0",
          Accept: "application/json,text/html,application/xhtml+xml,application/xml,*/*;q=0.9",
        },
        signal: controller.signal,
      });
      const contentType = response.headers.get("content-type") ?? "";
      const content = contentType.includes("application/json")
        ? await response.json()
        : await response.text();
      return {
        success: response.ok,
        content,
        metadata: { statusCode: response.status, contentType },
        error: response.ok ? undefined : `HTTP ${response.status}`,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        success: false,
        content: null,
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
