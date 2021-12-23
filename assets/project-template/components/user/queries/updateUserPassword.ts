// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql } from 'slonik';

interface UpdateUserPasswordQuery {
  username: string;
}

type UpdateUserPasswordPayload = { passwordHash: string };

/** @internal */
export function updateUserPasswordFactory(pool: DatabasePoolType) {
  return async (query: UpdateUserPasswordQuery, payload: UpdateUserPasswordPayload) => {
    return await pool.query(sql`
      UPDATE "users"
      SET 
        "passwordHash" = ${payload.passwordHash},
        "passwordLastChanged" = NOW(),
        "passwordResetToken" = NULL,
        "passwordResetTokenExpiry" = NULL
      WHERE 
        "username" = ${query.username}
      ;`);
  }
}
