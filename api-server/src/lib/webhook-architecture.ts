import type { ConnectionProvider } from "./connection-catalog";

export type ProviderWebhookEvent = {
  provider: ConnectionProvider;
  providerEventId?: string;
  eventType: string;
  payload: unknown;
  signature: string | undefined;
};

export interface ProviderWebhookVerifier {
  verify(event: ProviderWebhookEvent): Promise<boolean>;
}

export interface RevenueNormalizer<TNormalized> {
  normalize(event: ProviderWebhookEvent): TNormalized;
}

/**
 * Provider implementations plug into this boundary when their official API
 * credentials and webhook secrets are configured. It intentionally rejects
 * until signature verification exists; a webhook must never report success
 * before an event is verified and queued.
 */
export class UnconfiguredWebhookVerifier implements ProviderWebhookVerifier {
  async verify(_event: ProviderWebhookEvent): Promise<boolean> {
    return false;
  }
}