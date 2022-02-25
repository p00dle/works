import { ColumnType } from '../../types/table'

export const tableDbTypeMap: Record<ColumnType, string> = {
  'boolean': 'bool',                          'boolean[]': 'bool[]',
  'date': 'date',                             'date[]': 'date[]',
  'datetime': 'timestamp without time zone',  'datetime[]': 'timestamp without time zone[]',
  'enum': 'text',                             'enum[]': 'text[]',
  'float': 'real',                            'float[]': 'real[]',
  'integer': 'int4',                          'integer[]': 'int4[]',
  'json': 'json',                             'json[]': 'json[]',
  'jsonb': 'jsonb',                           'jsonb[]': 'jsonb[]',
  'serial': 'serial4',                        'serial[]': 'serial4[]',
  'text': 'text',                             'text[]': 'text[]',
  'uuid': 'uuid',                             'uuid[]': 'uuid[]',
}
