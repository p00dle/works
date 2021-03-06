import type { DatabasePoolType} from 'slonik';
import { sql, NotFoundError } from 'slonik';

/** @internal */
export function getLastMigrationFactory(pool: DatabasePoolType) {
  return async () => {
    try {
      const row = await pool.one<{version: number}>(sql`
        SELECT "version"
        FROM "works_migrationHistory"
        ORDER BY "version" DESC
        LIMIT 1;
        ;`
      );
      return row.version;
    } catch (error) {
      if (error instanceof NotFoundError) {
        return 0;
      } else {
        throw error;
      }
    }
  }
}
