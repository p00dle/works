import type { WsChannels } from 'works';
import { wsPubSubFactory } from 'works';

// @works:next_import

const channels: WsChannels[] = [
  // @works:next_route
]

export const wsPubSub = wsPubSubFactory(channels);
