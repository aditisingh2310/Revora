// Context the adapter needs to attribute a channel event to the right tenant and
// inbox. The shop / inbox / connection ids come from OUR database — never from
// the provider payload. The adapter uses them to populate the NormalizedMessage.
export interface AdapterContext {
  shopId: string;
  // Set by the route from the inbox that owns the connection. Optional so a pure
  // adapter unit test (no DB resolution) can still produce a valid message.
  inboxId?: string | null;
  channelConnectionId: string;
}

// Channels we have (or plan to have) adapters for. Kept minimal on purpose.
export type SupportedChannel = 'telegram';
