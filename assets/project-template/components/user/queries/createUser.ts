// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import type { User } from '../types';

import { sql } from 'slonik';

type CreateUserPayload = User;

/** @internal */
export function createUserFactory(pool: DatabasePoolType) {
  return async (_query: any, payload: CreateUserPayload) => {
    await pool.query(sql`
      INSERT INTO "users" (
        "username",
        "role",
        "email",
        "fullName",
        "managerId"
      )
      VALUES (
        ${payload.username},
        ${payload.role},
        ${payload.email},
        ${payload.fullName},
        ${JSON.stringify(payload.permissions)},
        ${payload.managerId}
      );`
    );
  }
}
