import type * as Passport from 'passport';
import type * as Express from 'express';
import type { Middleware } from 'works';

import { singleStrategyPassportFactory } from 'works';
import { passportParams } from '~/services/local-auth/passport-params';

export const [passport, passportAuthenticator]: [
  Passport.Authenticator<Express.Handler, any, any, Passport.AuthenticateOptions>,
  Middleware
] = singleStrategyPassportFactory(passportParams);

