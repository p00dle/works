import type { UnsafeUser } from '~/components/user';
import type { PassportParams } from 'works';

import { Strategy as LocalStrategy } from 'passport-local';
import { utils } from 'works';
import { unsafeReadUserByUsername } from '~/components/user/queries';

export const passportParams: PassportParams<UnsafeUser, string> = {
  strategyName: 'local',
  strategy: () => new LocalStrategy(async function verifyFunction(username, password, done) {
    try {
      const user = await unsafeReadUserByUsername({username});
      if (!user) return done(null, false, { message: 'Invalid credentials'});
      if (!utils.verifyHash(password, user.passwordHash)) return done(null, false, { message: 'Invalid credentials'});
      done(null, user);
    } catch (err) {
      done(err);
    }
  }),
  serializeUser: ({username}, done) => done(null, username),
  deserializeUser: async (username: string, done) => {
    try {
      const user = await unsafeReadUserByUsername({username});
      done(null, user);
    } catch (err) {
      done(err);
    }
  }
}