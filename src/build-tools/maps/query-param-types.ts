import { ColumnType } from '../../types/table';
import { QueryParamType } from '../../types/_common';


export const queryParamTypes: Record<ColumnType, QueryParamType> = {
  'boolean': 'boolean',
  'date': 'date',
  'datetime': 'datetime',
  'float': 'number',
  'integer': 'number',
  'json': 'string',
  'jsonb': 'string',
  'enum': 'string[]',
  'serial': 'number',
  'text': 'string',
  'uuid': 'string',
}