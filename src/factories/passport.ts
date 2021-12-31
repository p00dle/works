import type { PassportParams } from '../types/passport-params';;
import { Passport } from 'passport';
import * as passport from 'passport';
import * as express from 'express';

export function singleStrategyPassportFactory<U, I>(params: PassportParams<U, I>): [passport.Authenticator<express.Handler, any, any, passport.AuthenticateOptions>, express.RequestHandler] {
  const passport = new Passport();
  passport.use(params.strategyName, typeof params.strategy === 'function' ? params.strategy() : params.strategy);
  passport.serializeUser(params.serializeUser as (user: any, done: any) => void);
  passport.deserializeUser(params.deserializeUser);
  return [passport, passport.authenticate(params.strategyName)];
}






