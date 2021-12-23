import * as expressSession from 'express-session';
import { sessionSecret } from '~/bootstrap/global-env-vars';

export const sessionParser = expressSession.default({
  secret: sessionSecret,
  resave: false,
  name: 'session',
  saveUninitialized: true,  
});
