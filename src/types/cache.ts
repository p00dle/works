export type CacheController<Q extends {[prop: string]: any} = any, T = any> = (query: Q, ...args: any[]) => Promise<T> | T;
export type UpdateCache<U = any,T = any> = (update: U, currentState: T) => T
export type CacheStrategy = 
  | 'update'
  | 'flush'
;