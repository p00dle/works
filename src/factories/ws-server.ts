import type { ExpressHandler } from '../types/_common';

import * as http from 'http';
import * as WebSocket from 'ws';

interface WsServerFactoryParams {
  httpServer: http.Server;
  sessionParser: ExpressHandler;
}

export function wsServerFactory({httpServer, sessionParser}: WsServerFactoryParams): WebSocket.Server {
  return new WebSocket.Server({
    server: httpServer,
    verifyClient: process.env.BYPASS_AUTH === 'TRUE'
      ? (_req, done: (result: boolean, code?: number, name?: string) => void) => done(true)
      : ({req}: {origin: string, req: any, secure: boolean}, done: (result: boolean, code?: number, name?: string) => void) => {
        // @ts-ignore server response is not needed here, using a dummy one to satisfy contraints
        sessionParser(req, new http.ServerResponse(req), () => {
          const isAuthenticated = req && req.session && req.session.passport && req.session.passport.user;
          done(isAuthenticated, 403, 'Forbidden. Authentication required');
        });
    }
  });
}
