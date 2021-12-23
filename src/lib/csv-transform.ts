import { CsvColumn } from '../types/csv-endpoint';

type DateStringifier = { 
  stringify: (n : number) => string;
}

type Stringifier<T = any> = (row: T, datexDate: DateStringifier, datexDateTime: DateStringifier) => string;

function makeStringifier<T>(col: CsvColumn<T>): Stringifier<T> {
  switch (col.type) {
    case 'boolean': 
      return row => {
        const val = row[col.prop];
        return typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : '';
      }
    case 'format':
      return row => {
        return col.format(row[col.prop]);
      }
    case 'custom': 
      if (col.custom === undefined) throw Error('custom property needs to be a Stringifier when type is set to custom');
      return col.custom;
    case 'date':
      return (row, datex) => {
        const val = row[col.prop];
        return Number.isFinite(val) ? datex.stringify(val as unknown as number) : ''
      }
    case 'datetime':
      return (row, _, datex) => {
        const val = row[col.prop];
        return Number.isFinite(val) ? datex.stringify(val as unknown as number) : ''
      }   
    case 'float':  
      return row => {
        const val = row[col.prop];
        return Number.isFinite(val) ? '' + val : '';
      }
    case 'integer':
      return row => {
        const val = row[col.prop];
        return Number.isFinite(val) ? (val as unknown as number).toFixed(0) : ''
      }
    case 'percentage':
      return row => {
        const val = row[col.prop];
        return Number.isFinite(val) ? '' + (val as unknown as number * 100) + '%': '';
      }
    case 'string': 
      return row => {
        const val = row[col.prop];
        if (typeof val === 'string') {
          const hasQuotes = /"/.test(val);
          if (hasQuotes) return '"' + val.replace(/"/g, '""') + '"';
          return /,\n/.test(val) ? ('"' + val + '"') : val;
        } else {
          return val ? '' + val : '';
        }
      }
  }
}

export function csvTransformFactory<T>(columns: CsvColumn<T>[]): (datexDate: DateStringifier, datexDateTime: DateStringifier) => (obj: T) => string[] {
  const stringifiers = columns.map(makeStringifier)
  return (datexDate, datexDateTime) => row => stringifiers.map(stringifier => stringifier(row, datexDate, datexDateTime));
}