// @works-lock-file:false

import { dbPool } from '~/bootstrap/db-pool';

import { addUserTelemetryLogFactory } from './queries/addUserTelemetryLog';
import { streamUserTelemetryLogsFactory } from './queries/streamUserTelemetryLogs';

export const addUserTelemetryLog = addUserTelemetryLogFactory(dbPool);
export const streamUserTelemetryLogs = streamUserTelemetryLogsFactory(dbPool);