// @works-lock-file:false

import { dbPool } from '~/bootstrap/db-pool';

import { createAuthenticationLogFactory } from './queries/createAuthenticationLog';
import { streamAuthenticationLogsFactory } from './queries/streamAuthenticationLogs';

export const createAuthenticationLog = createAuthenticationLogFactory(dbPool);
export const streamAuthenticationLogs = streamAuthenticationLogsFactory(dbPool);
