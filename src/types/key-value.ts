export interface KeyValueStore<T extends {[key: string]: any}> {
  set: <K extends keyof T>(key: K, value: T[K] | null) => any;
  get: <K extends keyof T>(key: K) => Promise<T[K] | null>
}

export type KeyValueStoreFactory = <T extends {[key: string]: any}>(store: KeyValueStore<T>, initialState?: Partial<T> ) => KeyValueStore<T>;

