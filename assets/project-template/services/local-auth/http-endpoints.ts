// @works-lock-file:false

import { endpoint } from 'works';
import { passportAuthenticator } from '~/bootstrap/passport';
import { isSameUser } from '~/access-control';
import { logoutMiddleware } from './controllers/logout';
import { requestPasswordReset } from './controllers/request-password-reset';
import { resetPasswordAuthenticated, resetPasswordUnauthenticated } from './controllers/reset-password';

export const localAuthGetEndpoints = {
  '/account/logout': endpoint.get({
    middleware: logoutMiddleware,
    query: {},
    controller: () => void 0,
  }),
} as const;

export const localAuthPostEndpoints = {
  '/account/login': endpoint.post({
    accessControl: 'allow-unauthenticated',
    middleware: [passportAuthenticator],
    query: {},
    controller: (_query: any, _payload: {username: string, password: string}) => 'OK',
  }),
  '/account/password-reset-request': endpoint.post({
    accessControl: 'allow-unauthenticated',
    query: { email: 'string'},
    controller: requestPasswordReset,
  }),
  '/account/password-reset-unauthenticated': endpoint.post({
    accessControl: 'allow-unauthenticated',
    query: { username: 'string', password: 'string', password2: 'string', token: 'string'},
    controller: resetPasswordUnauthenticated,
  }),
  '/account/password-reset-authenticated': endpoint.post({
    accessControl: isSameUser,
    query: {},
    controller: resetPasswordAuthenticated,
  }),  
} as const;

export type LocalAuthGetApi = typeof localAuthGetEndpoints;
export type LocalAuthPostApi = typeof localAuthPostEndpoints;

