import * as passport from 'passport';

type DoneFunction<I> = (err: any, identity?: I) => void;

export type GeolocationLookup = (ipAddress: string) => Promise<{country: string, region: string, city: string}>;

export interface PassportParams<U,I> {
  strategyName: string;
  strategy: passport.Strategy | ((geoLookup?: GeolocationLookup) => passport.Strategy);
  serializeUser: (user: {username: string}, done: DoneFunction<I>) => void;
  deserializeUser: (identity: I, done: DoneFunction<U> ) => void;
  
}