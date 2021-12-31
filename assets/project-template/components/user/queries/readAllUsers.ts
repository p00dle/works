// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

type ReadAllUsersResult = User;

/** @internal */
export function readAllUsersFactory(pool: DatabasePoolType) {
  return async () => {
    return await pool.any<ReadAllUsersResult>(sql`
      SELECT 
        "username",
        "role",
        "email",
        "firstNames",
        "lastName",
        "permissions",
        "managerId"
      FROM "users"
      ;`
    );
  }
}
