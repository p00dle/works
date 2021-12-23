import pluralize from 'pluralize';
import { UserError } from '../build-tools/action-wrapper';

const toCapitalCase = (str: string): string => str.replace(/^./, (char) => char.toUpperCase());
const isLowerCase = (str: string): boolean => /^[a-z]+$/.test(str);
const isUpperCase = (str: string): boolean => /^[A-Z]+$/.test(str);
const isSnakeCase = (str: string): boolean => /_/.test(str);
const isKebabCase = (str: string): boolean => /-/.test(str);
const isPlural = (str: string): boolean => pluralize(str) === str;

function splitOnCapital(str: string): string[] {
  const camelCase = str[0].toLowerCase() === str[0];
  const matches = str.match(/[A-Z][a-z]*/g) as string[];
  const chunks = camelCase ? [str.slice(0, str.indexOf(matches[0])), ...matches] : matches;
  return chunks.map((str) => str.toLowerCase());
}

export type NamingCase = 'lower' | 'upper' | 'camel' | 'snake' | 'kebab' | 'pascal' | 'title';
export type SingleOrPlural = 'plural' | 'single' | 'same';


export type Names = Record<SingleOrPlural, Record<NamingCase, string>>;

export function getNames(str: string): Names {
  if (typeof str !== 'string') throw new UserError('Expected str to be a string');
  if (str.length === 0) throw new UserError('Expected str to be a non-zero length string');
  if (/[^[a-z_-]/i.test(str)) throw new UserError('Non letter characters not allowed. String: ' + str);
  const isStrPlural = isPlural(str);
  const single = isStrPlural ? pluralize(str, 1) : str;
  const plural = isStrPlural ? str : pluralize(str, 2);

  const [lowerCaseSingleChunks, lowerCasePluralChunks] =
    isLowerCase(str) || isUpperCase(str)
      ? [[single.toLowerCase()], [plural.toLowerCase()]]
      : isSnakeCase(str)
      ? [
          single.split('_').map((str) => str.toLowerCase()),
          plural.split('_').map((str) => str.toLowerCase()),
        ]
      : isKebabCase(str)
      ? [
          single.split('-').map((str) => str.toLowerCase()),
          plural.split('-').map((str) => str.toLowerCase()),
        ]
      : [splitOnCapital(single), splitOnCapital(plural)];
  const singleOutput = {
    lower: lowerCaseSingleChunks.join(''),
    upper: lowerCaseSingleChunks.join('').toUpperCase(),
    camel:
      lowerCaseSingleChunks[0] +
      lowerCaseSingleChunks.slice(1).map(toCapitalCase).join(''),
    snake: lowerCaseSingleChunks.join('_'),
    kebab: lowerCaseSingleChunks.join('-'),
    pascal: lowerCaseSingleChunks.map(toCapitalCase).join(''),
    title: lowerCaseSingleChunks.map(toCapitalCase).join(' '),
  };
  const pluralOutput = {
    lower: lowerCasePluralChunks.join(''),
    upper: lowerCasePluralChunks.join('').toUpperCase(),
    camel:
      lowerCasePluralChunks[0] +
      lowerCasePluralChunks.slice(1).map(toCapitalCase).join(''),
    snake: lowerCasePluralChunks.join('_'),
    kebab: lowerCasePluralChunks.join('-'),
    pascal: lowerCasePluralChunks.map(toCapitalCase).join(''),
    title: lowerCasePluralChunks.map(toCapitalCase).join(' '),
  };
  return {
    single: singleOutput,    
    plural: pluralOutput,
    same: isStrPlural ? pluralOutput : singleOutput,
  };
}
