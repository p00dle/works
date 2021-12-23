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
  wrapper: <C extends keyof T, E extends keyof T[C], F extends (props: T[C][E]) => any>(channel: C, event: E, fn: F) => (props: T[C][E]) => any;
}
