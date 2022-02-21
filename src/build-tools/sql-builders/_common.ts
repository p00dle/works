import type { ColumnType, Table, TableColumn, TableForeignKey } from '../../types/table';
import type { WorksConfigFile } from '../../types/config-file';

import { UserError } from '../action-wrapper';
import { getNames } from '../../lib/get-names';
import { isNonEmptyArray } from '../../lib/utils';
import { foreignKeyActionSqlMap } from '../maps/foreign-key-actions';
import { tableDbTypeMap } from '../maps/table-db-type';

export type { ColumnType, Table, TableColumn, TableForeignKey } from '../../types/table';
export type { WorksConfigFile } from '../../types/config-file';
export type SQL = string;

export type TableDiff = 
  | { type: 'rename-table', table: Table }
  | { type: 'create-column', table: Table, column: TableColumn }
  | { type: 'alter-column', table: Table, prevTable: Table, column: TableColumn, prevColumn: TableColumn }
  | { type: 'drop-column', table: Table, column: TableColumn }
  | { type: 'create-foreign-key', table: Table, foreignKey: TableForeignKey }
  | { type: 'drop-foreign-key', table: Table, foreignKey: TableForeignKey }
  | { type: 'create-index', table: Table, columnNames: string[] }
  | { type: 'drop-index', table: Table, columnNames: string[] }
  | { type: 'create-primary', table: Table, columnNames: string[] }
  | { type: 'drop-primary', table: Table }
;

export { getNames } from '../../lib/get-names';
export { tableDbTypeMap } from '../maps/table-db-type';

export function formatValue(value: any, type: ColumnType): SQL {
  if (value === null) return 'NULL';
  if (type === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (type === 'float' || type === 'integer' || type === 'serial') {
    const number = +value;
    if (isNaN(value)) return 'NULL';
    else return '' + number;
  }
  if (type === 'json' || type === 'jsonb') return `'${JSON.stringify(value)}'`;
  if (type === 'enum' || type === 'text') return `'${value}'`;
  if (type === 'uuid' && value === 'uuid') return `uuid_generate_v4()`;
  return `'${value}'`;
  // TODO: add defaults for date and datetime
  // TODO: test how it acts if there are newline characters in the string
}

// TODO: handle lockColumnNames
export function makeForeignKeyName(localTable: Table, foreignKey: TableForeignKey, config: WorksConfigFile, isEnum = false ): SQL {
  if (foreignKey.name) return foreignKey.name;
  const localTableName = getNames(localTable.name)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  const localColumnName = getNames(foreignKey.local)['same'][config.naming.dbColumns];
  if (isEnum) {
    return `FK_${localTableName}_${localColumnName}_ENUM`;
  }
  const remoteTable =  getNames(foreignKey.table)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  const remoteColumnName = getNames(foreignKey.remote)['same'][config.naming.dbColumns];
  return `FK_${localTableName}_${localColumnName}__${remoteTable}_${remoteColumnName}`;
}

export function makeIndexesName(table: Table, indexes: string[], config: WorksConfigFile): SQL {
  const tableName = getNames(table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  const colNames = indexes.map(col => getNames(col)['same'][config.naming.dbColumns]);
  return `IN_${tableName}__${colNames.join('_')}`;
}

export function makePrimaryName(table: Table, config: WorksConfigFile): SQL {
  if (!getPrimary(table)) return '';
  const tableName = getNames(table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]];
  return `PK_${tableName}`
}

export function getPrimary(table: Table): string[] | null {
  const primaryFromColumns = table.columns.filter(col => col.primary).map(col => col.name);
  const primaryFromTable = table.primary;
  if (primaryFromTable) {
    for (const colName of primaryFromTable) {
      if (!table.columns.find(col => col.name === colName)) {
        throw new UserError(`One of the columns in table primary property not found; column name: ${colName}`);
      }
    }
  }
  const hasPrimaryFromColumns = primaryFromColumns.length > 0;
  if (hasPrimaryFromColumns  && primaryFromTable) {
    throw new UserError(`Table cannot have primary columns and primary property at the same time; table name: ${table.name}`);
  }
  return hasPrimaryFromColumns 
    ? primaryFromColumns
    : primaryFromTable 
      ? Array.isArray(primaryFromTable)
        ? primaryFromTable
        : [primaryFromTable]
      : null;
}

export function getIndexes(table: Table): string[][] | null {
  const indexesFromColumns = table.columns.filter(col => col.indexed).map(col => [col.name]);
  const indexesFromTable = table.indexes;
  const hasIndexesFromColumns = isNonEmptyArray(indexesFromColumns)
  if (!indexesFromTable && !hasIndexesFromColumns) return null;
  return (indexesFromTable || []).concat(hasIndexesFromColumns ? indexesFromColumns : [])
}

export function makeForeignKeySql(table: Table, foreignKey: TableForeignKey, config: WorksConfigFile, isEnum = false ): SQL {
  return `CONSTRAINT "${
      makeForeignKeyName(table, foreignKey, config, isEnum)
    }" FOREIGN KEY ("${
      getNames(foreignKey.local)['same'][config.naming.dbColumns]
    }") REFERENCES "${
      isEnum ? foreignKey.table : getNames(foreignKey.table)[config.naming.dbTables[0]][config.naming.dbTables[1]]
    }" ("${
      isEnum ? foreignKey.remote : getNames(foreignKey.remote)['same'][config.naming.dbColumns]
    }") ON UPDATE ${
      foreignKey.onUpdate ? foreignKeyActionSqlMap[foreignKey.onUpdate] : 'NO ACTION'
    } ON DELETE ${
      foreignKey.onDelete ? foreignKeyActionSqlMap[foreignKey.onDelete] : 'NO ACTION'
    }`;
}

export function makePrimaryKeySql(table: Table, columns: string[], config: WorksConfigFile): SQL {
  return `CONSTRAINT "${makePrimaryName(table, config)}" PRIMARY KEY (${columns.map(name => `"${getNames(name)['single'][config.naming.dbColumns]}"`).join(', ')})`;
}

export function makeIndexSql(table: Table, columns: string[], config: WorksConfigFile): SQL {
  return `CREATE INDEX "${
      makeIndexesName(table, columns, config)
    }" ON "${
      getNames(table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]]
    }" (${
      columns.map(name => `\n  "${getNames(name)['single'][config.naming.dbColumns]}"`).join(', ')
    }\n);`;
}

export function makeColumnSql(col: TableColumn, config: WorksConfigFile): SQL {
  const colName = getNames(col.name)['same'][config.naming.dbColumns];
  const colType = tableDbTypeMap[col.type];
  const sqlChunks: string[] = [];
  sqlChunks.push(`"${colName}" ${colType}`);
  if (col.nullable === false) {
    sqlChunks.push('NOT NULL');
  }
  if (col.defaultTo) {
    sqlChunks.push('DEFAULT ' + formatValue(col.defaultTo, col.type));
  } 
  if (col.unique) {
    sqlChunks.push('UNIQUE');
  }
  return sqlChunks.join(' ');
}

export function makeEnumTableName(table: Table, column: TableColumn, config: WorksConfigFile): SQL {
  return `${
    getNames(table.name)[config.naming.dbTables[0]][config.naming.dbTables[1]]
  }_${
    getNames(column.name)['same'][config.naming.dbColumns]
  }_ENUM`;
}



export function makeCreateEnumTableSql(table: Table, column: TableColumn, config: WorksConfigFile): SQL {
  if (!isNonEmptyArray(column.enumValues)) throw new UserError(`Column of type enum must have enumValue property set to string[]; column name: ${column.name}`)
  const tableName = makeEnumTableName(table, column, config);
  return `CREATE TABLE "${
    tableName
  }" (\n  "enum_value" text UNIQUE PRIMARY KEY\n);\n\nINSERT INTO "${
    tableName
  }" ("enum_value") VALUES\n${
    column.enumValues.map(val => `  ('${val}')`).join(',\n')
  };`
}
/*
  if (col.type === 'enum') {
    if (foreignKey) throw new UserError(`Column ${col.name} in table ${table.name} cannot have foreign key constraint while being an enum`);
    sqlCommands.push(`CREATE TABLE "${tableName}_${colName}_enum" (
enum_value text PRIMARY KEY        
);

INSERT INTO "${tableName}_${colName}_enum" (enum_value) VALUES
${(col.enumValues as string[]).map(val => `  ('${val}')`).join(',\n')};
`);
    
    sqlChunks.push(`REFERENCES "${tableName}_${colName}_enum" (enum_value) ON UPDATE CASCADE`);
  }

*/