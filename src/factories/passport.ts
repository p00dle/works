import type { PassportParams } from '../types/passport-params';;
import { Passport } from 'passport';

export function singleStrategyPassportFactory<U, I>(params: PassportParams<U, I>) {
  const passport = new Passport();
  passport.use(params.strategyName, typeof params.strategy === 'function' ? params.strategy() : params.strategy);
  passport.serializeUser(params.serializeUser as (user: any, done: any) => void);
  passport.deserializeUser(params.deserializeUser);
  passport.authenticate(params.strategyName);
  return passport;
}






