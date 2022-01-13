// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { AuthenticationLog } from '../types';

import { sql } from 'slonik';

type CreateAuthenticationLogPayload = Omit<AuthenticationLog, 'uuid'>;

/** @internal */
export function createAuthenticationLogFactory(pool: DatabasePoolType) {
  return async (payload: CreateAuthenticationLogPayload) => {
    await pool.query(sql`
      INSERT INTO "authenticationLogs" (
        "timestamp",
        "username",
        "success",
        "ipAddress"
      )
      VALUES (
        ${payload.timestamp},
        ${payload.username},
        ${payload.success},
        ${payload.ipAddress}
      );`
    );
  }
}
