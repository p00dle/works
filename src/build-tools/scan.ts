import * as ts from 'typescript';
import * as path from 'path';
import { getRootDir } from '../lib/get-rootdir';
import { Table } from '../types/table';
import { readWorksConfigFile } from '../lib/read-works-config';
import { dir, file } from '../lib/file';
import { generateComponentFiles } from './generate-component-files';
import { updateCommonFiles } from './update-common-files';
import { makeDiffs } from './sql-builders/diff';
import { makeAlterTableSql } from './sql-builders/alter';
import { makeCreateTableSql } from './sql-builders/create';
import { UserError } from './action-wrapper';
import { envVar } from '../..';

type TableCache = Record<string, Table>;

let tableCachePath: string = '';
function getTableCachePath() {
  if (tableCachePath === '') tableCachePath = path.join(getRootDir(), '.works/table-cache.json');
  return tableCachePath;
}

async function getComponentPaths(dirPath: string, paths: string[], componentDir: string): Promise<string[]> {
  const filesOrDirs = (await dir.read(dirPath)).map(file => path.join(dirPath, file));
  await Promise.all(filesOrDirs.map(async fileOrDir => {
    const isDirectory = (await file.stats(fileOrDir)).isDirectory();
    if (isDirectory) {
      await getComponentPaths(fileOrDir, paths, componentDir);
    } else if (path.basename(fileOrDir, '.ts') === 'table.config') {
      paths.push(path.dirname(fileOrDir).replace(componentDir, '').replace(/\\/g, '/'));
    }
  }))
  return paths;
}


async function getTableCache(): Promise<TableCache> {
  try {
    return JSON.parse(await file.read.text(getTableCachePath())) as TableCache;
  } catch {
    return {}
  }
}

function validateTable(table: Table): void {
  // TODO: add initial validation; no fks, primary as needs done elsewhere
}

async function loadTable(tableDir: string): Promise<Table> {
  try {
    const tablePath = path.join(tableDir, 'table.config.ts');
    const tableCode = await file.read.text(tablePath);
    const transpiledCode = ts.transpileModule(tableCode, {}).outputText;
    const table = eval(transpiledCode);
    if (!table) throw new UserError('No table exported from file: ' + tablePath);
    validateTable(table);
    return table;
  } catch (err) {
    console.error('Error reading table file: ' + path);
    throw err;
  }
}

async function getVersion(migrationsPath: string, increment: boolean): Promise<string> {
  if (!(await dir.exists(migrationsPath))) {
    await dir.create(migrationsPath);
    return 'v001';
  }
  const files = await dir.read(migrationsPath);
  if (files.length === 0) return 'v001';
  files.sort();
  const lastVersion = parseInt(files[files.length - 1].replace(/[^\d]+/g, '')) + (increment ? 1 : 0);
  return `v${lastVersion.toString().padStart(3, '0')}`;

}

export async function reconcile() {
  return scanProject(true);
}

export async function scanProject(reconcile: boolean) {
  if (reconcile) {
    const isProduction = envVar({var: 'NODE_ENV', type: 'boolean', defaultTo: false, parse: str => str.toLowerCase().includes('prod')});
    if (isProduction) throw new UserError('Reconciliation not allowed in production environment');
  }
  const rootDir = getRootDir();
  const config = await readWorksConfigFile();
  const componentDir = path.join(rootDir, 'components');
  const paths = await getComponentPaths(componentDir, [], componentDir);
  const cache = reconcile ? {} : (await getTableCache());
  const newCache: TableCache = {};
  // TODO: tables need to be read in sync so that tables can be dropped; if reconcile all should be dropped; if not only the ones not found in new tables
  // TODO: add table validation here; overall shape of table object and foreign keys; primary keys and enumValues are already checked elsewhere
  const migrationPaths = (await Promise.all(paths.map(async componentPath => {
    const absoluteComponentPath = path.join(rootDir, 'components', componentPath)
    const table = await loadTable(absoluteComponentPath);
    const prevTable = cache[componentPath];
    newCache[componentPath] = table;
    if (table.lock && !reconcile) return '';
    let sql: string = '';
    if (prevTable) {
      const diffs = makeDiffs(table, cache[componentPath], config);
      if (diffs.length === 0) return '';
      sql = makeAlterTableSql(prevTable.name, diffs, config);
    } else {
      sql = makeCreateTableSql(table, config);
    }
    const migrationsPath = path.join(absoluteComponentPath, 'migrations'); 
    await dir.createIfNotExists(migrationsPath);
    const version = await getVersion(migrationsPath, true);
    if (!reconcile) {
      await generateComponentFiles(absoluteComponentPath, table);
      await file.write.text(path.join(migrationsPath, `${version}.sql`), sql);
    } 
    if (reconcile && !table.lock) {
      const migrationFiles = await dir.read(migrationsPath);
      await Promise.all(migrationFiles.map(filename => file.delete(path.join(migrationsPath, filename))));
      sql = makeCreateTableSql(table, config);
      await file.write.text(path.join(migrationsPath, `v001.sql`), sql);
    }
    if (!reconcile) {
      await updateCommonFiles(absoluteComponentPath.replace(path.join(rootDir, 'components'), '').replace(/\\/g, '/'), table);
      console.log('Component updated: ' + componentPath);
      return absoluteComponentPath.replace(rootDir, '.').replace(/\\/g, '/') + `/migrations/${version}.sql`;
    } else {
      const migrationFiles = (await dir.read(migrationsPath))
        .map(filename => path.join(migrationsPath, filename))
        .map(filepath => filepath.replace(rootDir, '.').replace(/\\/g, '/'));
      return migrationFiles.join('\n');
    }
  }))).filter(path => path !== '');
  if (migrationPaths.length === 0) return 'No components to update';
  const migrationsPath = path.join(rootDir, 'migrations');
  const migrationFileVersion = reconcile ? 'v001' : await getVersion(migrationsPath, true);
  if (reconcile) {
    const migrationFiles = await dir.read(migrationsPath);
    await Promise.all(migrationFiles.map(filename => file.delete(path.join(migrationsPath, filename))));
  }
  await file.write.text(path.join(migrationsPath, migrationFileVersion + '.txt'), migrationPaths.join('\n'));
  await file.write.json(getTableCachePath(), newCache);
  return 'Components updated total: ' + migrationPaths.length;
}