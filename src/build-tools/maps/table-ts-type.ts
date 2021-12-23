import { ColumnType } from '../../types/table'

export const tableTsTypeMap: Record<ColumnType, string> = {
  'boolean': 'bool',
  'date': 'number',
  'datetime': 'number',
  'enum': '',
  'float': 'number',
  'integer': 'number',
  'json': '',
  'jsonb': '',
  'serial': 'number',
  'text': 'string',
  'uuid': 'string',
}
