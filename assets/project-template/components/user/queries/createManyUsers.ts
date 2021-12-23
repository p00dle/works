// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

type CreateManyUsersPayload = User[];

/** @internal */
export function createManyUsersFactory(pool: DatabasePoolType) {
  return async (_query: void, payload: CreateManyUsersPayload) => {
    await pool.query(sql`
      INSERT INTO "users" (
        "username",
        "role",
        "email",
        "fullName",
        "managerId",
      )
      SELECT * FROM ${sql.unnest(
        payload.map(payload => [
          payload.username,
          payload.role,
          payload.email,
          payload.fullName,
          payload.managerId,
        ]),
        [
          'text',
          'text',
          'text',
          'text',
          'text',
          'text'
        ]
      )};`
    );
  }
}
