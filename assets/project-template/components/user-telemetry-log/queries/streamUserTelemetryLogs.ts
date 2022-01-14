// @works-lock-file:false

import type { Readable } from 'stream';
import type { DatabasePoolType} from 'slonik';
import { sql } from 'slonik';
import { utils } from 'works';

type StreamUserTelemetryLogsQuery = {
  since?: number
}

/** @internal */
export function streamUserTelemetryLogsFactory(pool: DatabasePoolType) {
  return (query: StreamUserTelemetryLogsQuery) => {
    return new Promise<Readable>(resolve => {
      pool.stream(sql`
        SELECT 
          "uuid",
          "type",
          "username",
          "path",
          "timestamp",
          "interval",
          "details"
        FROM "userTelemetryLogs"
        ${utils.isNumber(query.since) ? sql`WHERE "timestamp" >= ${utils.toSqlDate(query.since)}` : sql``}
        ;`, resolve);
    });
  }
}