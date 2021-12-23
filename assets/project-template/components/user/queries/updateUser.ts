// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

interface UpdateUserQuery {
  username: string;
}

type UpdateUserPayload = Pick<User, 'role' | 'email' | 'fullName' | 'managerId'>;

/** @internal */
export function updateUserFactory(pool: DatabasePoolType) {
  return async (query: UpdateUserQuery, payload: UpdateUserPayload) => {
    return await pool.query(sql`
      UPDATE "usersTemps"
      SET 
        "role" = ${payload.role},
        "email" = ${payload.email},
        "fullName" = ${payload.fullName},
        "managerId" = ${payload.managerId}
      WHERE 
        "username" = ${query.username}
      ;`);
  }
}
