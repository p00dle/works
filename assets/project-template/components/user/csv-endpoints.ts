// @works-lock-file:false

import type { CsvColumn } from 'works';
import type { User } from './types';

import { csvEndpoint } from 'works';
import { roleBased } from '~/access-control';
import { streamUsers } from './queries';

const userQuery = {
  timezoneOffset: 'number',
  dst: ['eu', 'us', 'none'],
} as const;

const userCsvColumns: CsvColumn<User>[] = [
  {prop: 'username', type: 'string', label: 'Username'},
  {prop: 'role', type: 'string', label: 'Role'},
  {prop: 'email', type: 'string', label: 'Email'},
  {prop: 'fullName', type: 'string', label: 'Full Name'},
  {prop: 'managerId', type: 'string', label: 'Manager ID'},
  {prop: 'lastLogin', type: 'datetime', label: 'Last Login'},
];


export const userCsvEndpoints = {
  '/users': csvEndpoint({
    accessControl: roleBased('admin'),
    query: userQuery,
    controller: streamUsers,
    filename: 'users',
    columns: userCsvColumns,
  }),
} as const;

export type UserCsvApi = typeof userCsvEndpoints;