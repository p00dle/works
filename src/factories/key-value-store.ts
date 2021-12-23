import { KeyValueStore, KeyValueStoreFactory } from '../types/key-value';

export const keyValueStoreFactory: KeyValueStoreFactory = (store, initialState) => {
  if (initialState) {
    for (const [key, value] of Object.entries(initialState)) {
      store.set(key, value);
    }
  }
  return store;
}

export const inMemoryKeyValueStore: KeyValueStore<{[key: string]: any}> & {_data: {[key: string]: any}} = {
  _data: {},
  get: async (key: string | number) => typeof inMemoryKeyValueStore._data[key] === 'undefined' ? null : inMemoryKeyValueStore._data[key],
  set: async (key: string | number, value: any) => (inMemoryKeyValueStore._data[key] = value)
}
