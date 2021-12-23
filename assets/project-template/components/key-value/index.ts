import { getValue, setValue } from './queries';

export const dbKeyValueStore = {
  get: getValue,
  set: setValue,
}
