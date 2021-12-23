import * as Express from 'express';


export type HttpMethod = 
  | 'GET'
  | 'POST'
;

export type QueryParamType = 
  | 'string'    | 'string?'
  | 'string[]'  | 'string[]?'
  | 'number'    | 'number?'
  | 'boolean'   | 'boolean?'
  | 'date'      | 'date?'
  | 'datetime'  | 'datetime?'
  | 'infer'
  | readonly string[]

export type QueryParams = {[key: string]: QueryParamType}

export type QueryType<T extends QueryParams> = {
  [K in keyof T]:  
    T[K] extends 'string' ? string :
    T[K] extends 'string?' ? string | undefined :
    T[K] extends 'string[]' ? string[] :
    T[K] extends 'string[]?' ? string[] | undefined :
    T[K] extends 'number' ? number :
    T[K] extends 'number?' ? number | undefined :
    T[K] extends 'date' ? number :
    T[K] extends 'date' ? number | undefined :
    T[K] extends 'boolean' ? boolean :
    T[K] extends 'boolean' ? boolean | undefined :
    T[K] extends readonly string[] ? T[K][number] :
    never
}

export type ParamType<T extends QueryParamType> = 
  T extends 'string' ? string :
  T extends 'string[]' ? string[] :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'date' ? number :
  T extends readonly string[] ? T[number] :
  never;

export function type<T>(ret?: T) {
  return (ret || null) as unknown as T;
}

export type Enum<T extends readonly string[]> = T[number];

export type PromiseReturnType<T extends () => any> = T extends () => Promise<infer X> ? X : ReturnType<T>;

export type AccessControl<U = any, Q = any> = (user: U, query: Q, req?: Express.Request) => boolean | Promise<boolean>;

export type ExpressHandler = (req: Express.Request, res: Express.Response, next: Express.NextFunction) => void | Promise<void>;