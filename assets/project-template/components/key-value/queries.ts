import { cache } from 'works';
import { dbPool } from '~/bootstrap/db-pool';
import { events } from '~/bootstrap/events';
import { getFactory } from './queries/get';
import { setFactory } from './queries/set';

const keyValueCache = cache(getFactory(dbPool));
events.subscribe('key-value', '*', keyValueCache.invalidate);

export const setValue = setFactory(dbPool);
export const getValue = (key: string) => keyValueCache.controller({key});