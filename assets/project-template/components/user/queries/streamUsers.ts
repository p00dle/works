// @works-lock-file:false

import type { DatabasePool, DatabaseStream } from 'works';
import { sql } from 'slonik';

/** @internal */
export function streamUsersFactory(pool: DatabasePoolType) {
  return () => {
    return new Promise<DatabaseStream>(resolve => {
      pool.stream(sql`
      SELECT 
        "username",
        "role",
        "email",
        "firstNames",
        "lastName",
        "lastLogin",
        "managerId"
      FROM "users"
      ;`, resolve);
    });
  }
}