// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql } from 'slonik';

interface DeleteUserQuery {
  username: string;
}

/** @internal */
export function deleteUserFactory(pool: DatabasePoolType) {
  return async (query: DeleteUserQuery) => {
    await pool.query(sql`
      DELETE FROM "users"
      WHERE 
        "username" = ${query.username}
      ;`
    );
  }
}
