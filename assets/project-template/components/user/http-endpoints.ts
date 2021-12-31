// @works-lock-file:false

// TODO: IMPLEMENT PATHS FOR OTHER QUERIES

import { endpoint } from 'works';
import { adminOnly } from '~/access-control';
import { addUsernameToQuery } from './middlewares/addUsernameToQuery';

import {
 readAllUsers,
 readUserByUsername,
 createManyUsers,
 createUser,
 deleteUser,
 updateUser,
} from './queries'

export const userGetEndpoints = {
  '/users/userdata': endpoint.get({
    middleware: [addUsernameToQuery],
    query: { username: 'string?'},
    controller: readUserByUsername,
  }),
  '/users': endpoint.get({
    accessControl: adminOnly,
    query: {},
    controller: readAllUsers,
  }),
} as const;

export const userPostEndpoints = {
  '/users/create': endpoint.post({
    accessControl: adminOnly,
    query: {},
    controller: createUser,
  }),
  '/users/create-many': endpoint.post({
    accessControl: adminOnly,
    query: {},
    controller: createManyUsers,
  }),
  '/users/delete': endpoint.post({
    accessControl: adminOnly,
    query: { username: 'string'},
    controller: deleteUser,
  }),
  '/users/update': endpoint.post({
    accessControl: adminOnly,
    query: { username: 'string'},
    controller: updateUser,
  }),  
} as const;

export type UserGetApi = typeof userGetEndpoints;
export type UserPostApi = typeof userPostEndpoints;
