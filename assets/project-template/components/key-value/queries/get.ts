// @works-lock-file:false

import type { DatabasePoolType } from 'slonik';
import { sql, NotFoundError } from 'slonik';

/** @internal */
export function getFactory(pool: DatabasePoolType) {
  return async ({key}: {key: string}) => {
    try {
      const row = await pool.one<{value: any}>(sql`
        SELECT "value"
        FROM "works_keyValues"
        WHERE "key" = ${key}
        ;`
      );
      return row.value;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return null;
      } else {
        throw error;
      }
    }
  }
}
