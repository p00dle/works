import type { DateXOptions } from '../datex';

export type CsvColumnType = 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'datetime' | 'time' | 'custom';

export interface CsvColumn<T, P extends keyof T = keyof T> {
  prop: P;
  type: CsvColumnType;
  stringify?: (val: T[P]) => string;
  parse?: (str: string) => T[P];
  label?: string;
}

export interface CsvOptions {
  delimiter: string;
  quote: string;
  escapeQuote: string;
  rowSeparator: string;
  ignoreUnderscoredProps: boolean;
  dateOptions: Omit<DateXOptions, 'format'> & {
    dateFormat: string;
    dateTimeFormat: string;
    timeFormat: string;
  };
}

export type CsvParams = Partial<Omit<CsvOptions, 'dateOptions'> & {dateOptions?: Partial<CsvOptions['dateOptions']>}>;

export type CsvColumns<T> = CsvColumn<T>[] | readonly CsvColumn<T>[];