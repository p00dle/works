export type ColumnType = 
  | 'text'        | 'text[]'
  | 'float'       | 'float[]'
  | 'integer'     | 'integer[]' 
  | 'datetime'    | 'datetime[]' 
  | 'date'        | 'date[]' 
  | 'boolean'     | 'boolean[]' 
  | 'enum'        | 'enum[]' 
  | 'serial'      | 'serial[]' 
  | 'json'        | 'json[]' 
  | 'jsonb'       | 'jsonb[]' 
  | 'uuid'        | 'uuid[]' 
;
// TODO: add array types


export interface TableColumn {
  name: string;
  type: ColumnType;
  enumValues?: string[] | readonly string[];
  nullable?: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultTo?: any;
  primary?: boolean;
}

export type OnUpdateDeleteAction = 
  | 'no-action'
  | 'restrict'
  | 'cascade'
  | 'set-null'
  | 'set-default'
;

export interface TableForeignKey {
  name?: string;
  table: string;
  local: string;
  remote: string;
  onUpdate?: OnUpdateDeleteAction;
  onDelete?: OnUpdateDeleteAction;
}

// type TableLockType =
//   | 'none'
//   | 'column-names'
//   | 'queries'
//   | 'migrations'
//   | 'http-api'
//   | 'ws-api'
//   | 'types'
//   | 'ws-channels'
//   | 'events'
// ;

// // TODO: add custom lock implementation

export interface Table {
  // lock?: TableLockType | TableLockType[];
  lock: boolean;
  lockColumnNames?: boolean;
  name: string;
  columns: TableColumn[];
  foreignKeys?: TableForeignKey[];
  primary?: string[];
  indexes?: string[][];
}