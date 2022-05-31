import { CsvColumn, CsvColumns, CsvOptions, CsvColumnType, CsvParams } from './types';
import { camelCaseToTitleCase, normalizeOptions } from './utils';
import { DateX } from '../datex';

type StringifyersByType = Record<CsvColumnType, (val: any) => string>;

function stringifyersByTypeFactory(dateOptions: CsvOptions['dateOptions']): StringifyersByType {
  const datexDate = new DateX({...dateOptions, format: dateOptions.dateFormat});
  const datexDateTime = new DateX({...dateOptions, format: dateOptions.dateTimeFormat});
  const datexTime = new DateX({...dateOptions, format: dateOptions.timeFormat});
  return {
    string: (x) => (typeof x === 'string' ? x : x ? '' + x : ''),
    integer: (x) => (x !== undefined && x !== null && !isNaN(x) ? (typeof x === 'number' ? x.toFixed(0) : '' + x) : ''),
    float: (x) => (x !== undefined && x !== null && !isNaN(x) ? '' + x : ''),
    boolean: (x) => (x !== undefined && x !== null) ? (x ? 'TRUE' : 'FALSE') : '',
    date: (x) => datexDate.stringify(x),
    datetime: (x) => datexDateTime.stringify(x),
    time: (x) => datexTime.stringify(x),
    custom: x => x === undefined || x === null ?  '' : '' + x,
  }
}

function getStringify(prop: string, stringifyers: StringifyersByType): (a: any) => string {
  const [isTime, isDate, isTimestamp] = ['Time', 'Date', 'Timestamp'].map(
    (str) => prop.toLowerCase() === str.toLowerCase() || prop.includes(str),
  );
  if (isTimestamp || (isTime && isDate)) return stringifyers.datetime;
  else if (isTime) return stringifyers.time;
  else if (isDate) return stringifyers.date;
  else return stringifyers.custom;
}

function makeColumns<T>(arr: T[] | readonly T[], stringifyers: StringifyersByType, ignoreUnderscored: boolean): CsvColumn<T>[] {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  let props = Object.keys(arr[0]) as (keyof T)[];
  if (ignoreUnderscored) props = props.filter((prop) => String(prop)[0] !== '_');
  return props.map((prop: keyof T) => ({
    label: camelCaseToTitleCase(String(prop)),
    prop,
    type: 'custom' as const,
    stringify: getStringify(String(prop), stringifyers),
  }));
}

function shouldEscape(str: string, delimiter: string, escape: string, rowSeperator: string): boolean {
  return str.indexOf(delimiter) !== -1 || str.indexOf(escape) !== -1 || str.indexOf('\n') !== -1 || str.indexOf('\r') !== -1 || str.indexOf(rowSeperator) !== -1;
}

function escape(str: string, quote: string, escapeQuote: string, quoteRegex: RegExp): string {
  return quote + str.replace(quoteRegex, escapeQuote) + quote;
}


export function stringifyCsv<T>(arr: T[] | readonly T[], columns?: CsvColumns<T>, options?: CsvParams) {
  const { delimiter, quote, escapeQuote, ignoreUnderscoredProps, rowSeparator, dateOptions, skipHeader } = normalizeOptions(options);
  const stringifyersByType = stringifyersByTypeFactory(dateOptions);
  const quoteRegex = new RegExp(quote, 'g');
  const cols = Array.isArray(columns) ? columns : makeColumns(arr, stringifyersByType, ignoreUnderscoredProps);
  const stringifyers = cols.map(col => col.type === 'custom' ? col.stringify || stringifyersByType[col.type] : stringifyersByType[col.type] );
  const width = cols.length;
  const height = arr.length;
  const props = cols.map(col => col.prop);
  const rows = skipHeader ? [] : [cols.map(col => col.label || col.prop).join(delimiter)];
  const shouldTestForEscape = cols.map(col => col.type === 'string' || col.type === 'custom');
  let rowIndex = skipHeader ? 0 : 1;
  for (let row = 0; row < height; row++ ) {
    const rowStrings: string[] = [];
    for (let col = 0; col < width; col++ ) {
      let str = stringifyers[col](arr[row][props[col]]);
      if (shouldTestForEscape[col] && shouldEscape(str, delimiter, quote, rowSeparator)) str = escape(str, quote, escapeQuote, quoteRegex);
      rowStrings[col] = str;
    }
    rows[rowIndex++] = rowStrings.join(delimiter);
  }
  return rows.join(rowSeparator);
}
