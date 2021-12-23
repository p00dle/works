import * as express from 'express';
import { QueryParams, QueryType, HttpMethod, AccessControl, PromiseReturnType } from './_common';



interface Endpoint<Q extends QueryParams, T, P> {
  accessControl?: 'allow-unauthenticated' | AccessControl<any, Q extends undefined ? void : QueryType<Q>>;
  query?: Q;
  middleware?: express.RequestHandler[];
  controller: (query: QueryType<Q> extends {[x: string]: never} ? void : QueryType<Q>, payload: P) => T;
}

export type EndpointFactory = <Q extends QueryParams, T, P>(endpoint: Endpoint<Q,T,P>) => Endpoint<Q,T,P>;

export type Endpoints = {
  [Method in HttpMethod]?: {
    [Route: string]: Endpoint<any, any, any>;
  }
}

export type HttpApiParser<T extends Endpoints> = {
  [M in keyof T]: {
    [R in keyof T[M]]: {
      // @ts-ignore
      query: QueryType<T[M][R]['query']>;
      // @ts-ignore
      response: PromiseReturnType<T[M][R]['controller']>;
      // @ts-ignore
      payload: Parameters<T[M][R]['controller']>[1];
    }
  }
}

// TODO: when extracted query is query | undefined; needs fixed