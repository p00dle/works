// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

interface ReadUserByEmailQuery {
  email: string;
}

type ReadUserByEmailResult = User;

/** @internal */
export function readUserByEmailFactory(pool: DatabasePoolType) {
  return async (query: ReadUserByEmailQuery) => {
    return await pool.one<ReadUserByEmailResult>(sql`
      SELECT 
        "username",
        "email",
        "fullName"
      FROM "users"
      WHERE
        "email" = ${query.email}
      ;`
    );
  }
}
