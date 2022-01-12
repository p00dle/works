// @works-lock-file:false

import type { CsvColumn } from 'works';
import type { UserTelemetryLog } from './types';

import { csvEndpoint } from 'works';
import { roleBased } from '~/access-control';
import { streamUserTelemetryLogs } from './queries';

const userTelemetryLogsQuery = {
  timezoneOffset: 'number',
  dst: ['eu', 'us', 'none'],
  since: 'number?',
} as const;

const userCsvColumns: CsvColumn<UserTelemetryLog>[] = [
  {prop: 'uuid', type: 'string', label: 'UUID'},
  {prop: 'type', type: 'string', label: 'Type'},
  {prop: 'username', type: 'string', label: 'Username'},
  {prop: 'path', type: 'string', label: 'Path'},
  {prop: 'timestamp', type: 'datetime', label: 'Timestamp'},
  {prop: 'interval', type: 'integer', label: 'Interval'},
];

export const userTelemetryLogsCsvEndpoints = {
  '/users': csvEndpoint({
    accessControl: roleBased('admin'),
    query: userTelemetryLogsQuery,
    controller: streamUserTelemetryLogs,
    filename: 'user-telemetry-logs',
    columns: userCsvColumns,
  }),
} as const;

export type UserTelemetryLogsCsvApi = typeof userTelemetryLogsCsvEndpoints;