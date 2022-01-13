// @works-lock-file:false

import type { CsvColumn } from 'works';
import type { AuthenticationLog } from './types';

import { csvEndpoint } from 'works';
import { roleBased } from '~/access-control';
import { streamAuthenticationLogs } from './queries';

const authenticationLogAllPropsQuery = {
  timezoneOffset: 'number',
  dst: ['eu', 'us', 'none'],
} as const;

const AuthenticationLogCsvColumns: CsvColumn<AuthenticationLog>[] = [
  {prop: 'uuid', type: 'string', label: 'Uuid'},
  {prop: 'timestamp', type: 'datetime', label: 'Timestamp'},
  {prop: 'username', type: 'string', label: 'Username'},
  {prop: 'success', type: 'boolean', label: 'Success'},
  {prop: 'ipAddress', type: 'string', label: 'Ip Address'},
];

export const authenticationLogCsvEndpoints = {
  '/authenticationlogs': csvEndpoint({
    accessControl: roleBased('admin'),
    query: authenticationLogAllPropsQuery,
    controller: streamAuthenticationLogs,
    filename: 'authentication-logs',
    columns: AuthenticationLogCsvColumns,
  }),
} as const;

export type AuthenticationLogCsvApi = typeof authenticationLogCsvEndpoints;