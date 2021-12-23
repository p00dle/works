import { Table, WorksConfigFile, SQL, TableForeignKey, makeEnumTableName } from './_common';

import { makePrimaryKeySql, makeIndexSql, makeForeignKeySql, makeColumnSql, getNames, getPrimary, getIndexes, makeCreateEnumTableSql, TableColumn } from './_common';
import { isNonEmptyArray } from '../../lib/utils';

export function makeCreateTableSql(table: Table, config: WorksConfigFile): SQL {
  const tableName = getNames(table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  const sqlCommands: string[] = [];
  const columnsSql = table.columns.map(col => makeColumnSql(col, config));

  const primaryCols = getPrimary(table);
  if (isNonEmptyArray(primaryCols)) {
    columnsSql.push(makePrimaryKeySql(table, primaryCols, config));
  } 
  if (isNonEmptyArray(table.foreignKeys)) {
    for (const fk of table.foreignKeys || []) {
      columnsSql.push(makeForeignKeySql(table, fk, config));
    }
  }
  const indexes = getIndexes(table);

  const enumColumns = table.columns.filter(col => col.type === 'enum');
  for (const column of enumColumns) {
    sqlCommands.push(makeCreateEnumTableSql(table, column as TableColumn & { enumValues: string[] }, config));
    const fk: TableForeignKey = {
      local: column.name,
      remote: 'enum_value',
      table: makeEnumTableName(table, column, config)
    }
    columnsSql.push(makeForeignKeySql(table, fk, config, true));
  }

  sqlCommands.push(`CREATE TABLE "${tableName}" (\n${columnsSql.map(str => '  ' + str).join(',\n')}\n);`);
  for (const colNames of indexes || []) {
    sqlCommands.push(makeIndexSql(table, colNames, config));
  }

  return sqlCommands.join('\n\n');
}
