import { TableDiff, WorksConfigFile, SQL, makeColumnSql, makeForeignKeySql, makeForeignKeyName, makeIndexSql, makeIndexesName, makePrimaryKeySql, makePrimaryName, makeEnumTableName, makeCreateEnumTableSql, TableForeignKey } from './_common';

import { getNames } from './_common';
import { areArraysSame, isNonEmptyArray } from '../../lib/utils';

export function makeAlterTableSql(prevTableName: string, diffs: TableDiff[], config: WorksConfigFile): SQL {
  const tableName = getNames(prevTableName)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  const sqlDropIndexes: string[] = [];
  const sqlCreateEnumTables: string[] = [];
  const sqlRename: string[] = [];
  const sqlDropConstraints: string[] = [];
  const sqlColumns: string[] = [];
  const sqlAddConstraints: string[] = [];
  const sqlAddIndexes: string[] = [];
  
  for (const diff of diffs) {
    switch(diff.type) {
      case 'rename-table':
        sqlRename.push(`  RENAME TO "${
          getNames(diff.table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]]
          }"`);  
        break;
      case 'create-column':
        sqlColumns.push(`ADD COLUMN ${
          makeColumnSql(diff.column, config)
        }`);
        if (diff.column.type === 'enum') {
          sqlCreateEnumTables.push(makeCreateEnumTableSql(diff.table, diff.column, config));
          const fk: TableForeignKey = {
            local: diff.column.name,
            remote: 'enum_value',
            table: makeEnumTableName(diff.table, diff.column, config)
          }
          sqlAddConstraints.push('ADD ' + makeForeignKeySql(diff.table, fk, config, true));
        }
        break;
      case 'drop-column':
        sqlColumns.push(`DROP COLUMN "${
          getNames(diff.column.name)['same'][config.naming.dbColumns]
          }" CASCADE`);
        if (diff.column.type === 'enum') {
          sqlCreateEnumTables.push(`DROP TABLE "${makeEnumTableName(diff.table, diff.column, config)}"`);
          sqlDropConstraints.push(`DROP CONSTRAINT "${makeEnumTableName(diff.table, diff.column, config)}";`)
        }
        break;
      case 'alter-column':
        sqlColumns.push(`ALTER COLUMN ${
          makeColumnSql(diff.column, config)
        }`);
        const areEnumValuesSame = areArraysSame(diff.column.enumValues, diff.prevColumn.enumValues);
        if (diff.prevColumn.type === 'enum' && !areEnumValuesSame) {
          sqlCreateEnumTables.push(`DROP TABLE "${makeEnumTableName(diff.table, diff.column, config)}";`);
          sqlDropConstraints.push(`DROP CONSTRAINT "${makeEnumTableName(diff.table, diff.column, config)}";`)
        }
        if (diff.column.type === 'enum' && !areEnumValuesSame) {
          sqlCreateEnumTables.push(makeCreateEnumTableSql(diff.table, diff.column, config));
          const fk: TableForeignKey = {
            local: diff.column.name,
            remote: 'enum_value',
            table: makeEnumTableName(diff.table, diff.column, config)
          }
          sqlAddConstraints.push('ADD ' + makeForeignKeySql(diff.table, fk, config, true))
        }
        break;
      case 'create-foreign-key':
        sqlAddConstraints.push('ADD ' + makeForeignKeySql(diff.table, diff.foreignKey, config));
        break;
      case 'drop-foreign-key':
        sqlDropConstraints.push(`DROP CONSTRAINT "${makeForeignKeyName(diff.table, diff.foreignKey, config)}"`)
        break;
      case 'create-index':
        sqlAddIndexes.push(makeIndexSql(diff.table, diff.columnNames, config));
        break;
      case 'drop-index':
        sqlDropIndexes.push(`DROP INDEX "${makeIndexesName(diff.table, diff.columnNames, config)}";`)
        break;
      case 'create-primary':
        sqlAddConstraints.push('ADD ' + makePrimaryKeySql(diff.table, diff.columnNames, config));
        break;
      case 'drop-primary':
        sqlDropConstraints.push(`DROP CONSTRAINT "${makePrimaryName(diff.table, config)}"`);
        break;
      default:
        // @ts-expect-error
        throw Error('Invalid diff type: ' + diff.type);
    }
  }
  const sqlTableCommands = [
    ...sqlRename,
    ...sqlDropConstraints,
    ...sqlColumns,
    ...sqlAddConstraints
  ];
  let sqlCommands = sqlCreateEnumTables
  if (isNonEmptyArray(sqlTableCommands)) {
    sqlCommands.push(`ALTER TABLE "${tableName}"\n${sqlTableCommands.map(str => '  ' + str).join(',\n')}\n;`);
  }
  sqlCommands = sqlCommands.concat(sqlAddIndexes);
  return sqlCommands.join('\n\n');
}
