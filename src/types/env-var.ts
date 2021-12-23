import type { QueryParamType, ParamType } from './_common'

interface EnvVar<T extends QueryParamType, R extends undefined | boolean, D extends ParamType<T> | undefined> {
  type: T;
  var: string;
  defaultTo?: D;
  required?: R;
  parse?: (str: string) => ParamType<T>;
}

interface EnvVarTyped<T, R extends undefined | boolean, D extends T | undefined> {
  type: 'infer'
  var: string;
  defaultTo?: D;
  required?: R;
  parse: (str: string) => T;
}

export type EnvVarFactory = 
  <Q extends QueryParamType, R extends boolean | undefined, T, D extends Q extends 'infer' ? any | undefined : any | undefined>
  (params: Q extends 'infer' ? EnvVarTyped<T, R, D> : EnvVar<Q, R, D>) 
  => Q extends 'infer'
    ? R extends true 
      ? T
      : D extends undefined
        ? T | null
        : T
    : R extends true 
      ? ParamType<Q> 
      : D extends undefined 
        ? ParamType<Q> | null
        : ParamType<Q>
