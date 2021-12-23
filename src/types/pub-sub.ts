export interface PubSub<T, K extends keyof T = keyof T> {
  publish: (channel: K, payload: T[K]) => void;
  subscribe: (channel: K, listener: (payload: T[K]) => void) => void;
  unsubscribe: (channel: K, listener: (payload: T[K]) => void) => void;
}

export type PubSubFactory = <T extends any>(initialValue?: T | null) => T | null;

export type PubSubMap = { [channel: string]: ReturnType<PubSubFactory>};