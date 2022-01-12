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
      if (utils.isNumber(query.since)) {
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
          WHERE "timestamp" >= ${utils.toSqlDate(query.since)}
          ;`, resolve);
      } else {

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
        ;`, resolve);
      }
    });
  }
}