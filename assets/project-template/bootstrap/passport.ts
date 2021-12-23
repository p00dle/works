import { singleStrategyPassportFactory } from 'works';
import { passportParams } from '~/services/local-auth/passport-params';

export const passport = singleStrategyPassportFactory(passportParams);
