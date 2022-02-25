import { CsvColumnType } from '../../types/csv-endpoint';
import { ColumnType } from '../../types/table';

export const csvTypeMap: Record<ColumnType, CsvColumnType> = {
  'boolean': 'boolean',
  'date': 'date',
  'datetime': 'datetime',
  'enum': 'string',
  'float': 'float',
  'integer': 'integer',
  'json': 'string',
  'jsonb': 'string',
  'serial': 'integer',
  'text': 'string',
  'uuid': 'string',

  'boolean[]': 'string',
  'date[]': 'string',
  'datetime[]': 'string',
  'enum[]': 'string',
  'float[]': 'string',
  'integer[]': 'string',
  'json[]': 'string',
  'jsonb[]': 'string',
  'serial[]': 'string',
  'text[]': 'string',
  'uuid[]': 'string',
}