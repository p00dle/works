// @works-lock-file:false

import type { Readable } from 'stream';
import type { DatabasePoolType} from 'slonik';
import { sql } from 'slonik';

/** @internal */
export function streamUsersFactory(pool: DatabasePoolType) {
  return () => {
    return new Promise<Readable>(resolve => {
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