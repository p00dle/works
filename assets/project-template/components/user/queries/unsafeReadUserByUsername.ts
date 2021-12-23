// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { UnsafeUser } from '../types';

import { sql } from 'slonik';

interface ReadUserByUsernameQuery {
  username: string;
}

type ReadUserByUsernameResult = UnsafeUser;

/** @internal */
export function unsafeReadUserByUsernameFactory(pool: DatabasePoolType) {
  return async (query: ReadUserByUsernameQuery) => {
    return await pool.one<ReadUserByUsernameResult>(sql`
      SELECT 
        "uuid",
        "username",
        "passwordHash",
        "role",
        "email",
        "fullName",
        "managerId",
        "lastLogin",
        "passwordLastChanged",
        "passwordResetToken",
        "passwordResetTokenExpiry",
        "permissions"
      FROM "users"
      WHERE
        "username" = ${query.username}
      ;`
    );
  }
}
