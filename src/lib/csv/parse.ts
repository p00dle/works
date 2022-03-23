import { DateX } from '../datex';
import type { CsvColumns, CsvParams, CsvOptions, CsvColumnType } from './types';
import { normalizeOptions } from './utils';

type ParsersByType = Record<CsvColumnType, (str: string) => any>

function parsersByTypeFactory(dateOptions: CsvOptions['dateOptions']): ParsersByType {
  const datexDate = new DateX({...dateOptions, format: dateOptions.dateFormat});
  const datexDateTime = new DateX({...dateOptions, format: dateOptions.dateTimeFormat});
  const datexTime = new DateX({...dateOptions, format: dateOptions.timeFormat});
  return {
    string: (x) => (x === '' ? undefined : x),
    integer: (x) => (x === '' ? undefined : parseInt(x, 10)),
    float: (x) => (x === '' ? undefined : parseFloat(x)),
    boolean: (x) => (x === '' ? undefined : x !== '0' && x !== 'false' && x !== 'FALSE'),
    date: (x) => (x === '' ? undefined : datexDate.parse(x)),
    datetime: (x) => (x === '' ? undefined : datexDateTime.parse(x)),
    time: (x) => (x === '' ? undefined : datexTime.parse(x)),
    custom: (x) => (x === '' ? undefined : x),
  }
}

function getStartAndEndIndex(text: string, options: CsvOptions): [number, number] {
  // remove BOM if present as well as any space characters
  let startIndex = text.search(/\S/);
  if (text.substring(startIndex, startIndex + 3) === 'ï»¿') startIndex += 3;
  // remove lines that do not look like a header; does it for first 10 rows
  // if there is only one column or if the first row contains commas no changes are made to startIndex
  // TODO: if there is only one column and some of the rows contain a comma this will break
  for (let x = 10, start = startIndex, end: number; x--; ) {
    end = text.indexOf(options.rowSeparator, start + 1);
    if (end === -1) break;
    const line = text.substring(start, end);
    if (line.indexOf(options.delimiter) !== -1) {
      startIndex = startIndex === start ? startIndex : start + 1;
      break;
    }
    start = end + 1;
  }
  if (text[startIndex] === '\r') startIndex++;
  // remove salesforce footer if present
  const rSfdcFooter = /\s*"[^"]+"\s*"Copyright \(c\) \d\d\d\d-\d\d\d\d salesforce.com, inc\. All rights reserved\.[\s\S]+$/;
  // remove empty lines and spaces from the end
  let endIndex = text.search(rSfdcFooter);
  if (endIndex === -1) {
    endIndex = text.length - 1;
    while (/\s/.test(text[endIndex])) endIndex--;
    endIndex++;
  }
  return [startIndex, endIndex];
}

// returns column headers, index of first non-header row, and end index of last row
function getInfo(text: string, options: CsvOptions): [string[], number, number] {
  const [startIndex, endOfText] = getStartAndEndIndex(text, options);
  const headerEndIndex = text.indexOf(options.rowSeparator, startIndex);
  if (headerEndIndex === -1) return [[], 0, 0];
  const escapeQuoteRegex = new RegExp(options.escapeQuote, 'g');
  const fields = text
    .substring(startIndex, headerEndIndex)
    .trim()
    .split(options.delimiter)
    .map((str) => (str[0] === options.quote ? str.substring(1, str.length - 1).replace(escapeQuoteRegex, options.quote) : str));
  return [fields, headerEndIndex + 1, endOfText];
}

const untypedColumn = {
  type: 'custom',
  parse: (str: string) => str === '' ? undefined : str,
} as const;

export function parseCsv<T = Record<string, any>>(rawCsvString: string, columns?: CsvColumns<T>, options?: CsvParams): T[] {
  const options2 = normalizeOptions(options);
  const { delimiter, quote, escapeQuote, rowSeparator } = options2;
  const text = rawCsvString.replace(/\r/g, '');
  const [csvCols, startAtIndex, endOfText] = getInfo(text, options2);
  const output = [];
  const colNames: string[] = columns
    ? columns.map((x) => x.label || x.prop as string)
    : csvCols;
  const colIndexes = columns
    ? colNames.map((label) => csvCols.indexOf(label))
    : csvCols.map((_,i) => i);
  const useColumn = colIndexes.map((index) => index !== -1);
  const saveFieldAs = columns
    ? colIndexes.map((index) => (index === -1 ? null : columns[index].label || columns[index].prop))
    : csvCols
  const optionsInCsv = columns
    ? colIndexes.map((index) => (index === -1 ? null : columns[index]))
    : csvCols.map(() => untypedColumn)
  const escapeQuoteRegex = new RegExp(escapeQuote, 'g');
  const parsersByType = parsersByTypeFactory(options2.dateOptions);
  const parsers = optionsInCsv.map((option) => {
    if (option === null) return null;
    if (option.type === 'custom') return option.parse;
    else return parsersByType[option.type];
  });
  const width = csvCols.length;
  let index = startAtIndex;
  let rowValues: Partial<T> = {};
  let row = 0;
  let col = 0;
  let indexOfNewLine = 0;
  while (index < endOfText) {
    if (col === 0) rowValues = {};
    const from = index;
    let value;
    if (text[index] === delimiter) {
      while (true) {
        index = text.indexOf(quote, index + 1);
        if (index === -1) throw Error('Unterminated quote');
        if (text[index + 1] === quote) index++;
        else break;
      }
      value = text.substring(from + 1, index).replace(escapeQuoteRegex, quote);
      index += 2;
      indexOfNewLine = 0;
    } else {
      const indexOfComma = text.indexOf(delimiter, index);
      if (indexOfNewLine === 0) indexOfNewLine = text.indexOf(rowSeparator, index);
      if (indexOfComma === -1) {
        if (indexOfNewLine !== -1) {
          value = text.substring(from, indexOfNewLine);
          index = indexOfNewLine + 1;
          indexOfNewLine = 0;
        } else {
          value = text.substring(from, endOfText);
          index = endOfText;
        }
      } else {
        const to = indexOfComma < indexOfNewLine || indexOfNewLine === -1 ? indexOfComma : indexOfNewLine;
        value = text.substring(from, to);
        index = to + 1;
      }
    }
    if (useColumn[col]) {
      rowValues[saveFieldAs[col] as keyof T] = value === '' ? undefined : (parsers[col as number] as (str: string) => any)(value);
    }
    col++;
    if (col === width) {
      output[row] = rowValues;
      col = 0;
      row++;
      indexOfNewLine = 0;
    }
  }
  const lastCol = width - 1;
  if (col !== 0 && useColumn[lastCol]) {
    rowValues[saveFieldAs[col] as keyof T] = undefined;
    output[row] = rowValues;
  }
  return output as T[];
}
