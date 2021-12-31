import type { Middleware } from 'works';
import * as expressSession from 'express-session';
import { sessionSecret } from '~/bootstrap/global-env-vars';

export const sessionParser: Middleware = expressSession.default({
  secret: sessionSecret,
  resave: false,
  name: 'session',
  saveUninitialized: true,  
});
