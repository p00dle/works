// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql } from 'slonik';

interface UpdateUserTokenQuery {
  username: string;
}

type UpdateUserTokenPayload = { passwordResetToken: string };

/** @internal */
export function updateUserTokenFactory(pool: DatabasePoolType) {
  return async (query: UpdateUserTokenQuery, payload: UpdateUserTokenPayload) => {
    return await pool.query(sql`
      UPDATE "users"
      SET 
        "passwordResetToken" = ${payload.passwordResetToken},
        "passwordResetTokenExpiry" = NOW() + INTERVAL '1 day'
      WHERE 
        "username" = ${query.username}
      ;`);
  }
}
