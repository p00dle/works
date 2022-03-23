import type { CsvOptions, CsvParams } from './types';

export const defaultOptions: CsvOptions = {
  delimiter: ',',
  quote: '"',
  escapeQuote: '""',
  rowSeparator: '\n',
  ignoreUnderscoredProps: false,
  dateOptions: {
    timezoneOffset: 0,
    dst: 'none',
    dateTimeFormat: 'YYYY-MM-DD HH:mm',
    timeFormat: 'HH:mm',
    dateFormat: 'YYYY-MM-DD',
  }
}

export function normalizeOptions(options?: CsvParams): CsvOptions {
  return options
    ? {
      ...defaultOptions,
      ...options,
      dateOptions: options.dateOptions ? { ...defaultOptions.dateOptions, ...options.dateOptions} : defaultOptions.dateOptions
    }
    : defaultOptions
}


export function camelCaseToTitleCase(str: string): string {
  return str.replace(/[A-Z]/g, x => ' ' + x).replace(/^[a-z]/, x => x.toUpperCase());
} 
