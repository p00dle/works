// @works-lock-file:false

// TODO: IMPLEMENT PATHS FOR OTHER QUERIES

import { endpoint } from 'works';
import { roleBased, isSameUser, isManagerOf } from '~/access-control';

import {
 readAllUsers,
 readUserByUsername,
 createManyUsers,
 createUser,
 deleteUser,
 updateUser,
} from './queries'

const adminOnly = roleBased('admin');

export const userEndpoints = {
  GET: {
    '/users/:username': endpoint({
      accessControl: isSameUser,
      query: { username: 'string'},
      controller: readUserByUsername,
    }),
    '/users': endpoint({
      accessControl: adminOnly,
      controller: readAllUsers,
    }),
  },
  POST: {
    '/users/create': endpoint({
      accessControl: adminOnly,
      controller: createUser,
    }),
    '/users/create-many': endpoint({
      accessControl: adminOnly,
      controller: createManyUsers,
    }),
    '/users/delete': endpoint({
      accessControl: adminOnly,
      query: { username: 'string'},
      controller: deleteUser,
    }),
    '/users/update': endpoint({
      accessControl: adminOnly,
      query: { username: 'string'},
      controller: updateUser,
    }),  
  },
} as const;

export type UserApi = typeof userEndpoints;

