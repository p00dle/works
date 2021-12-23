// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql } from 'slonik';

interface UpdateUserLastLoginQuery {
  username: string;
}

/** @internal */
export function updateUserLastLoginFactory(pool: DatabasePoolType) {
  return async (query: UpdateUserLastLoginQuery, payload: void) => {
    return await pool.query(sql`
      UPDATE "users"
      SET 
        "lastLogin" = NOW()
      WHERE 
        "username" = ${query.username}
      ;`);
  }
}
