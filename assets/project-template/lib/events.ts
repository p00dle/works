import type { Logger } from 'works';

export type Events = Record<string, Record<string, any>>;

export type EventListener<T extends Events, C extends keyof T, E extends keyof T[C]> = (payload: T[C][E], event?: E, channel?: C) => any;

export interface BaseEventEmitter {
  emit: (event: string | symbol, args: any) => any;
  addListener: (event: string | symbol, listener: (...args: any[]) => any) => any;
  removeListener: (event: string | symbol, listener: (...args: any[]) => any) => any;
}

export interface WorksEventEmitter<T extends Events> {
  publish: <C extends keyof T, E extends keyof T[C]>(channel: C, event: E, payload: T[C][E]) => any;
  subscribe: <C extends keyof T, E extends keyof T[C]>(channel: C | "*", event: E | "*", listener: EventListener<T, C, E>) => void;
  unsubscribe: <C extends keyof T, E extends keyof T[C]>(channel: C | "*", event: E | "*", listener: EventListener<T, C, E>) => void;
  wrapper: <C extends keyof T, E extends keyof T[C], F extends (query: any, payload: T[C][E]) => any>(channel: C, event: E, fn: F) => (query: any, payload: T[C][E]) => any;
}


export function eventsFactory<T extends Events>(emitter: BaseEventEmitter, logger: Logger): WorksEventEmitter<T> {
  const log = logger.namespace('Works.Events');
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

