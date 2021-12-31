import type { Readable } from 'node:stream';
import type { AccessControl, QueryParams, QueryType } from './_common';

interface DateStringifier { 
  stringify: (n : number) => string;
}

type Stringifier<T = any> = (row: T, datexDate: DateStringifier, datexDateTime: DateStringifier) => string;

export type CsvColumnType = 
  | 'string'
  | 'integer'
  | 'float'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'percentage'
;

export type CsvColumn<T = any, P extends keyof T = keyof T>  = {
  prop: P;
  type: CsvColumnType;
  label?: string;
} | {
  prop: P;
  type: 'format';
  label?: string;
  format: (val: T[P]) => string;
} | {
  type: 'custom';
  label: string;
  custom: Stringifier<T>;
}

export interface CsvEndpoint<Q extends QueryParams, T> {
  accessControl?: AccessControl<any, Q extends undefined ? void : QueryType<Q>>;
  query: Q;
  controller: (query: QueryType<Q>) => Promise<Readable>;
  filename: string | ((query: QueryType<Q>) => string);
  columns: CsvColumn[] | ((query: QueryType<Q>) => CsvColumn[]);  
}

export type CsvEndpointFactory = <Q extends QueryParams, T>(csvEndpoint: CsvEndpoint<Q,T>) => CsvEndpoint<Q,T>

export type CsvEndpoints = {
  [Route: string]: CsvEndpoint<any, any>;
}

export type CsvApiParser<T extends CsvEndpoints> = {
  [R in keyof T]: Partial<QueryType<T[R]['query']>>;
}

