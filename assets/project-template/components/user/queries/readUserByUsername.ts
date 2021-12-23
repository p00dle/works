// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

interface ReadUserByUsernameQuery {
  username: string;
}

type ReadUserByUsernameResult = User;

/** @internal */
export function readUserByUsernameFactory(pool: DatabasePoolType) {
  return async (query: ReadUserByUsernameQuery) => {
    return await pool.one<ReadUserByUsernameResult>(sql`
      SELECT 
        "username",
        "role",
        "email",
        "firstNames",
        "lastName",
        "permissions"
      FROM "users"
      WHERE
        "username" = ${query.username}
      ;`
    );
  }
}
