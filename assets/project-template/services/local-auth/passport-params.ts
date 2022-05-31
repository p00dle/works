import type { UnsafeUser } from '~/components/user';
import type { PassportParams } from 'works';
import { Strategy as LocalStrategy } from 'passport-local';
import { utils } from 'works';
import { logger } from '~/bootstrap/logger';
import { unsafeReadUserByUsername } from '~/components/user/queries';
import { createAuthenticationLog } from '~/components/authentication-log';

// TODO: add over the wire rsa encryption using public/private key

export const passportParams: PassportParams<UnsafeUser, string> = {
  strategyName: 'local',
  strategy: geoLookup => new LocalStrategy({passReqToCallback: true}, async function verifyFunction(req, username, password, done) {
    try {
      const user = await unsafeReadUserByUsername({username});
      const ipAddress = req.socket.remoteAddress || 'unknown';
      const { country, region, city } = typeof geoLookup === 'function' && ipAddress !== 'unknown' ? (await geoLookup(ipAddress)) : {country: null, region: null, city: null};
      const authenticationLog = {
        username, ipAddress, country, region, city,
        timestamp: Date.now(),
        success: false,
      }
      if (!user || !utils.verifyHash(password, user.passwordHash)) {
        await createAuthenticationLog(authenticationLog);
        return done(null, false, { message: 'Invalid credentials'});
      } else {
        authenticationLog.success = true;
        await createAuthenticationLog(authenticationLog);
        done(null, user);
      }
    } catch (err) {
      logger.error(err instanceof Error ? (err.stack || 'Unknown error in passport verifyFunction') : String(err));
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