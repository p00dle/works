import { ColumnType } from '../../types/table'

export const tableDbTypeMap: Record<ColumnType, string> = {
  'boolean': 'bool',
  'date': 'date',
  'datetime': 'timestamp without time zone',
  'enum': 'text',
  'float': 'real',
  'integer': 'int4',
  'json': 'json',
  'jsonb': 'jsonb',
  'serial': 'serial4',
  'text': 'text',
  'uuid': 'uuid',
}
