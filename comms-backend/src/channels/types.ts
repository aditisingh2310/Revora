// Context the adapter needs to attribute a channel event to the right tenant.
// The shop + connection ids come from OUR database, never from the provider.
export interface ChannelContext {
  shopId: string;
  channelConnectionId: string;
}

export type SupportedChannel = 'telegram';
