// @works-lock-file:false

import type { DatabasePoolType, ValueExpressionType } from 'slonik';
import { Readable } from 'stream';
import { sql } from 'slonik';
import { utils } from 'works';


type ReadManyAuthenticationLogQuery = {
  username?: string;
  since?: number;
}

/** @internal */
export function streamAuthenticationLogsFactory(pool: DatabasePoolType) {
  return (query: ReadManyAuthenticationLogQuery) => {
    return new Promise<Readable>(resolve => {
      const sqlChunks: ValueExpressionType[] = [];
      if (utils.isNumber(query.since)) sqlChunks.push(sql`"timestamp" >= ${utils.toSqlDate(query.since)}`);
      if (typeof query.username === 'string') sqlChunks.push(sql`"username" = ${query.username}`);
      pool.stream(sql`
      SELECT 
        "uuid",
        "timestamp",
        "username",
        "success",
        "ipAddress",
        "country",
        "region",
        "city"
      FROM "authenticationLogs"
      ${sqlChunks.length > 0 ? sql`WHERE` : ''}
        ${sql.join(sqlChunks, sql` AND \n          `)}
      ;`, resolve);
    });
  }
}