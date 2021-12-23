import type { Logger } from '../types/logger';

import { noOpLogger } from '../defaults/noop-logger';
import { BaseEventEmitter, Events, WorksEventEmitter } from '../types/events';
import { isLogger } from './logger';

export function eventsFactory<T extends Events>(emitter: BaseEventEmitter, logger?: Logger): WorksEventEmitter<T> {
  const log = isLogger(logger) ? logger.namespace('Works.Events') : noOpLogger;
  let listeners: Record<string, Record<string, ((...args: any[]) => any)[]>> = {};
  let allChannelListeners: Record<string, ((...args: any[]) => any)[]> = {};
  emitter.addListener('works-event', ({channel, event, payload}: {channel: string, event: string, payload: any}) => {
    if (listeners[channel] && Array.isArray(listeners[channel][event])) listeners[channel][event].forEach(fn => fn(payload, channel, event));
    if (listeners[channel] && Array.isArray(listeners[channel]['*'])) listeners[channel]['*'].forEach(fn => fn(payload, channel, event));
    if (Array.isArray(allChannelListeners['*'])) allChannelListeners['*'].forEach(fn => fn(payload, channel, event));
    if (Array.isArray(allChannelListeners[event])) allChannelListeners[event].forEach(fn => fn(payload, channel, event));
  });
  const eventsEmitter: WorksEventEmitter<T> = {
    subscribe: (channel, event, listener) => {
      log.debug(`Subscribe; channel: ${channel}; event: ${event}`);
      if (channel === '*') {
        if (!allChannelListeners[event as string]) allChannelListeners[event as string] = [];
        allChannelListeners[event as string].push(listener);
      } else {
        if (!listeners[channel as string]) listeners[channel as string] = {};
        if (!listeners[channel as string][event as string]) listeners[channel as string][event as string] = [];
        listeners[channel as string][event as string].push(listener);
      }
    },
    unsubscribe: (channel, event, listener) => {
      log.debug(`Unsubscribe; channel: ${channel}; event: ${event}`);
      if (channel === '*') {
        if (!allChannelListeners[event as string]) return;
        if (!Array.isArray(allChannelListeners[event as string])) return;  
        const listenerIndex = allChannelListeners[event as string].indexOf(listener);
        if (listenerIndex < 0) return;  
        allChannelListeners[event as string].splice(listenerIndex, 1)
      } else {
        if (!listeners[channel as string]) return;
        if (!listeners[channel as string][event as string]) return;
        if (!Array.isArray(listeners[channel as string][event as string])) return;
        const listenerIndex = listeners[channel as string][event as string].indexOf(listener);
        if (listenerIndex < 0) return;
        listeners[channel as string][event as string].splice(listenerIndex, 1);
      }
    },
    publish: (channel, event, payload) => {
      log.debug(`Publish; channel: ${channel}; event: ${event}`);
      emitter.emit('works-event', {channel, event, payload});
    },
    wrapper: (channel, event, func) => {
      return async payload => {
        try {
          await func(payload);
          eventsEmitter.publish(channel, event, payload);
        } catch (err) {
          throw err;
        }
      }
    }
  }
  
  return eventsEmitter;
}

