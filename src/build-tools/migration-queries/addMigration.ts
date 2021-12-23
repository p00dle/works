import { DatabasePoolType, sql } from 'slonik';

/** @internal */
export function addMigrationFactory(pool: DatabasePoolTypeType) {
  return async (version: number) => {
    return await pool.query(sql`
      INSERT INTO "works_migrationHistory" (
        "version",
        "doneAt"
      ) 
      VALUES (
        ${version},
        NOW()
      );
      ;`);
  }
}
