import * as path from 'path';
import { createPool } from 'slonik';
import { Client }  from 'pg';
import { envVar } from '../factories/env-var';
import { dir, file } from '../lib/file';
import { addMigrationFactory } from './migration-queries/addMigration';
import { createMigrationTableFactory } from './migration-queries/createMigrationTable';
import { getLastMigrationFactory } from './migration-queries/getLastMigration';
import { getRootDir } from '../lib/get-rootdir';

async function createDatabase(url: string) {
  const databaseNameMatch = url.match(/[^\/]+$/);
  if (!databaseNameMatch || !databaseNameMatch[0]) throw Error('Invalid database url provided: ' + url);
  const databaseName = databaseNameMatch[0];
  const urlWithoutDatabase = url.slice(0, url.length - databaseName.length);
  const pgClient = new Client(urlWithoutDatabase);
  await pgClient.connect();
  await pgClient.query(`CREATE DATABASE "${databaseName}"`);
  console.info(`Database "${databaseName}" was created.`);
}

export async function runMigrations() {
  const databaseUrl = envVar({ type: 'string', var: 'DATABASE_URL', required: true });
  const rootDir = getRootDir();
  const migrationsDir = path.join(rootDir, './migrations');
  const dbPool = createPool(databaseUrl);
  let pgClient = new Client(databaseUrl);
  const createTable = createMigrationTableFactory(dbPool);
  const addMigration = addMigrationFactory(dbPool);
  const getLastMigration = getLastMigrationFactory(dbPool);
  const numberToVersion = (n: number): string => `v${String(n).padStart(3, '0')}`;
  const versionToNumber = (str: string): number => parseInt(str.replace(/[^\d]+/g, ''));

  try {
    await pgClient.connect();
  } catch (error) {
    const databaseDoesNotExist = /database "[^"]+" does not exist/i.test(String(error));
    if (databaseDoesNotExist) {
      await createDatabase(databaseUrl);
      pgClient = new Client(databaseUrl);
      await pgClient.connect();
    } 
    else throw error;
  }
  await pgClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await createTable();
  const lastMigration = await getLastMigration();
  const migrationFiles = await dir.read(migrationsDir);
  const migrationsVersions = migrationFiles.map(versionToNumber);
  const outstandingMigrations = migrationsVersions.filter(version => version > lastMigration);
  if (outstandingMigrations.length === 0) return 'Migrations up to date';
  try {
    await pgClient.query('BEGIN');
    for (const versionN of outstandingMigrations) {
      const versionText = numberToVersion(versionN)
      const filePath = path.join(migrationsDir, `${versionText}.txt`);
      const migrationFilePaths = (await file.read.text(filePath)).split('\n').map(str => str.trim()).filter(str => str !== '').map(filePath => path.join(rootDir, filePath));
      const migrationQueries = await Promise.all(migrationFilePaths.map(filePath => file.read.text(filePath)));
      for (const query of migrationQueries) {
        try {
          await pgClient.query(query);
        } catch (err) {
          console.error(`Error while applying migration ${versionText}`);
          console.error('Query: ' + query);
          throw err;
        }
      } 
      await addMigration(versionN);
      console.log(`Migration ${versionText} successful`);
    }
    await pgClient.query('COMMIT');
  } catch (err) {
    await pgClient.query('ROLLBACK');
    console.error('Migration failed. any changes have been rolled back');
    throw err;
  }
  return 'Success';
}
