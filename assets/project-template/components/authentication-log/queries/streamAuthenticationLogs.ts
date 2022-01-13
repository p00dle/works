// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import { Readable } from 'stream';

import { sql } from 'slonik';

type ReadManyAuthenticationLogQuery = {
    uuid: string;
    timestamp: number;
    username: string;
    success: bool;
    ipAddress: string;
}

/** @internal */
export function streamAuthenticationLogsFactory(pool: DatabasePoolType) {
  return (query: ReadManyAuthenticationLogQuery) => {
    return new Promise<Readable>(resolve => {
      pool.stream(sql`
      SELECT 
        "uuid",
        "timestamp",
        "username",
        "success",
        "ipAddress"
      FROM "authenticationLogs"
      WHERE
        "uuid" = ${query.uuid} AND
        "timestamp" = ${query.timestamp} AND
        "username" = ${query.username} AND
        "success" = ${query.success} AND
        "ipAddress" = ${query.ipAddress}
      ;`, resolve);
    });
  }
}