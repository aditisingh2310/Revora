export interface FetchResult {
  success: boolean;
  content: unknown;
  metadata?: Record<string, unknown>;
  error?: string;
  statusCode?: number;
}

export class FetcherError extends Error {}

export function validateTargetUrl(url: string, allowPrivateNetwork = false): string {
  try {
    const parsed = new URL(url.trim());
    const scheme = parsed.protocol.replace(":", "");
    if (scheme !== "http" && scheme !== "https") {
      throw new FetcherError("Target must be an absolute http:// or https:// URL");
    }
    if (parsed.username || parsed.password) {
      throw new FetcherError("Credentials in target URLs are not allowed");
    }
    if (!allowPrivateNetwork) {
      const hostname = parsed.hostname.toLowerCase();
      if (hostname === "localhost" || hostname.endsWith(".local")) {
        throw new FetcherError("Local-network targets require allowPrivateNetwork=true");
      }
      if (hostname === "127.0.0.1" || hostname === "::1") {
        throw new FetcherError("Private, loopback, link-local, and reserved targets are blocked by default");
      }
    }
    return parsed.toString();
  } catch (error) {
    if (error instanceof FetcherError) {
      throw error;
    }
    throw new FetcherError("Invalid target URL");
  }
}

export abstract class BaseFetcher {
  abstract fetch(target: string, config?: Record<string, unknown>): Promise<FetchResult>;
  async close(): Promise<void> {
    return;
  }
}
