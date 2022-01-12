// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { UserTelemetryLog } from '../types';

import { sql } from 'slonik';

type AddUserTelemetryLogPayload = UserTelemetryLog;

/** @internal */
export function addUserTelemetryLogFactory(pool: DatabasePoolType) {
  return async (_query: any, payload: AddUserTelemetryLogPayload) => {
    await pool.query(sql`
      INSERT INTO "userTelemetryLogs" (
        "uuid",
        "type",
        "username",
        "path",
        "timestamp",
        "interval",
        "details"
      )
      VALUES (
        ${payload.uuid},
        ${payload.type},
        ${payload.username},
        ${payload.path},
        ${payload.timestamp},
        ${payload.interval},
        ${JSON.stringify(payload.details)}
      )
      ON CONFLICT ("uuid")
      DO UPDATE SET  "interval "= ${payload.interval}
      WHERE "userTelemetryLogs"."uuid" = ${payload.uuid}
    `);
  }
}
