import { DatabasePoolType, sql } from 'slonik';

export function createMigrationTableFactory(pool: DatabasePoolTypeType) {
  return async () => {
    await pool.query(sql`
      CREATE TABLE IF NOT EXISTS "works_migrationHistory" ( 
        "version" INT4 UNIQUE,
        "doneAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
      );`);
  }
}
