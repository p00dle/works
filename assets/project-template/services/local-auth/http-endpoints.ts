// @works-lock-file:false

// TODO: IMPLEMENT PATHS FOR OTHER QUERIES

import { endpoint } from 'works';
import { passport } from '~/bootstrap/passport';
import { isSameUser } from '~/access-control';
import { logoutMiddleware } from './controllers/logout';
import { requestPasswordReset } from './controllers/request-password-reset';
import { resetPasswordAuthenticated, resetPasswordUnauthenticated } from './controllers/reset-password';

export const localAuthEndpoints = {
  GET: {
    '/account/logout': endpoint({
      middleware: logoutMiddleware,
      controller: () => void 0,
    }),
  },
  POST: {
    '/account/login': endpoint({
      accessControl: 'allow-unauthenticated',
      middleware: [passport],
      controller: (query: {username: string, password: string}) => void 0,
    }),
    '/account/password-reset-request': endpoint({
      accessControl: 'allow-unauthenticated',
      controller: requestPasswordReset,
    }),
    '/account/password-reset-unauthenticated': endpoint({
      accessControl: 'allow-unathenticated',
      query: { username: 'string'},
      controller: resetPasswordUnauthenticated,
    }),
    '/account/password-reset-authenticated': endpoint({
      accessControl: isSameUser,
      query: { username: 'string'},
      controller: resetPasswordAuthenticated,
    }),  
  },
} as const;

export type LocalAuthApi = typeof localAuthEndpoints;

