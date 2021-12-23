import * as passport from 'passport';

type DoneFunction<I> = (err: any, identity?: I) => void;

export interface PassportParams<U,I> {
  strategyName: string;
  strategy: passport.Strategy | (() => passport.Strategy);
  serializeUser: (user: {username: string}, done: DoneFunction<I>) => void;
  deserializeUser: (identity: I, done: DoneFunction<U> ) => void;
}