import type * as Passport from 'passport';
import type * as Express from 'express';
import type { GeolocationLookup, Middleware } from 'works';

import { singleStrategyPassportFactory } from 'works';
import { passportParams } from '~/services/local-auth/passport-params';

// update below if you are using a geolocation lookup library or service
const geoLookup: GeolocationLookup | undefined = undefined;

export const [passport, passportAuthenticator]: [
  Passport.Authenticator<Express.Handler, any, any, Passport.AuthenticateOptions>,
  Middleware
] = singleStrategyPassportFactory(passportParams, geoLookup);

