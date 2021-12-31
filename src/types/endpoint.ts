import * as express from 'express';
import { QueryParams, QueryType, AccessControl, PromiseReturnType } from './_common';

export interface GetEndpoint<Q extends QueryParams, T> {
  accessControl?: 'allow-unauthenticated' | AccessControl<any, QueryType<Q>>;
  query: Q;
  middleware?: express.RequestHandler[];
  controller: (query: QueryType<Q>) => T;
}

export interface PostEndpoint<Q extends QueryParams, T, P> {
  accessControl?: 'allow-unauthenticated' | AccessControl<any, QueryType<Q>>;
  query: Q;
  middleware?: express.RequestHandler[];
  controller: (query: QueryType<Q>, payload: P) => T
}

export type EndpointFactory = {
  get: <Q extends QueryParams, T>(endpoint: GetEndpoint<Q,T>) => GetEndpoint<Q,T>;
  post: <Q extends QueryParams, T, P>(endpoint: PostEndpoint<Q,T,P>) => PostEndpoint<Q,T,P>;
}

export type GetEndpoints = {
  [Route: string]: GetEndpoint<any, any>;
}

export type PostEndpoints = {
  [Route: string]: PostEndpoint<any, any, any>;
}

export type HttpGetApiParser<T extends GetEndpoints> = {
  [R in keyof T]: {
    query: QueryType<T[R]['query']>;
    response: PromiseReturnType<T[R]['controller']>;
  }
}

export type HttpPostApiParser<T extends PostEndpoints> = {
  [R in keyof T]: {
    query: QueryType<T[R]['query']>;
    response: PromiseReturnType<T[R]['controller']>;
    payload: Parameters<T[R]['controller']>[1];
  }
}



// TODO: when extracted query is query | undefined; needs fixed