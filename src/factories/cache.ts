import { UpdateCache, CacheController, CacheStrategy } from '../types/cache';

const noop: UpdateCache = function noop<U, T>(_: U, currentState: T): T {
  return currentState as unknown as T;
}

function stringifyQuery(query: any): string{
  switch(typeof query) {
    case 'boolean':
      return query ? 'true' : 'false';
    case 'bigint': 
    case 'function':
    case 'number':
      return query.toString();
    case 'object':
      return Array.isArray(query) ? query.map(stringifyQuery).join(',')
        : `{${Object.entries(query).sort(([a], [b]) => a > b ? 1 : -1).map(([key, value]) => `${key}:${stringifyQuery(value)}}`).join(',')}}`;
    case 'string':
      return query;
    case 'undefined':
    case 'symbol':
      return '';
  }
}


export function cache<Q extends {[prop: string]: any}, T, U>(controller: CacheController<Q,T>, updateCache: UpdateCache = noop, cacheStrategy: CacheStrategy = 'flush' ): 
   { controller: (query: Q) => Promise<T>, invalidate: () => void, update: (update: U) => void } {
  const cacheMap = new Map<string, T>();
  

  async function wrappedController(query: Q): Promise<T> {
    const key = stringifyQuery(query);
    if (cacheMap.has(key)) return cacheMap.get(key) as T;
    else {
      const value = await controller(query);
      cacheMap.set(key, value);
      return value;
    }
  }
  async function wrappedUpdate(update: U) {
    switch(cacheStrategy) {
      case 'flush':
        cacheMap.clear();
        break;
      case 'update':
        if (updateCache === noop) return;
        for (const key of Array.from(cacheMap.keys())) {
          cacheMap.set(key, updateCache(update, cacheMap.get(key) as T));
        }
        break;
      default:
        throw Error('Invalid cacheStrategy provided: ' + cacheStrategy)
    }
  }

  return { 
    controller: wrappedController, 
    invalidate: () => cacheMap.clear(), 
    update: wrappedUpdate };
}
