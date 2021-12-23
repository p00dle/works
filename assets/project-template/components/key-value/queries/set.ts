// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';

import { sql } from 'slonik';

/** @internal */
export function setFactory(pool: DatabasePoolType) {
  return async (key: string, value: any) => {
    return await pool.query(sql`
      UPDATE "works_keyValues"
      SET "value" = ${JSON.stringify(value)}
      WHERE "key" = ${key}
      ;`);
  }
}
