import type { WebSocket } from 'ws';
import type { AccessControl, QueryParams, QueryType } from './_common';

export interface WsChannel<T, Q extends QueryParams = any> {
  query?: Q;
  accessControl?: AccessControl<any, Q extends undefined ? void : QueryType<Q>>;
  select?: (query: QueryType<Q>, payload: T) => boolean | Promise<boolean>;
}

export type Listener = (socket: WebSocket, message: unknown) => any;

export type WsChannelFactory = <T, Q extends QueryParams = any>(channel: WsChannel<T,Q>) => WsChannel<T,Q>

export type WsChannels = {
  [Route: string]: WsChannel<any, any>;
}

export type WsChannelPayload<C extends WsChannel<any>> = C extends WsChannel<infer T> ? T : never;

export interface WsClientMessage<T extends WsChannels, C extends keyof T = keyof T> {
  channel: C;
  subscribe: boolean;
  query: QueryType<T[C]['query']>;
}

export interface WsClientMessageUntyped {
  channel: string;
  payload: unknown;
}

export type WsApiParser<T extends WsChannels> = {
  [R in keyof T]: {
    query: QueryType<T[R]['query']>;
    payload: WsChannelPayload<T[R]>;
  }
}