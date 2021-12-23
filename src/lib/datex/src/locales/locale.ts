import { LocaleInfo } from './interface';

function range(start: number, end: number): number[] {
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
}

function getOrdinalSuffixes(getOrdinal: (n: number) => string): string[] {
  const ordinals: Record<string, true> = {};
  for (const day of range(1, 31)) {
    const ordinal = getOrdinal(day).replace(/\d+/, '');
    ordinals[ordinal] = true;
  }
  return Object.keys(ordinals);
}

function getOrdinals(getOrdinal: (n: number) => string): string[] {
  const ordinals = [];
  for (const day of range(0, 31)) {
    ordinals[day] = '' + day + getOrdinal(day);
  }
  return ordinals;
}

function createMap(arr: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (let i = 0, l = arr.length; i < l; i++) {
    map[arr[i].toLowerCase()] = i;
  }
  return map;
}

export class LocaleData {
  public monthNames: string[];
  public monthNamesShort: string[];
  public weekDays: string[];
  public weekDaysShort: string[];
  public ordinalSuffixes: string[];
  public ordinals: string[];
  public monthNumbers: Record<string, number>;
  public monthNumbersShort: Record<string, number>;

  constructor(localeInfo: LocaleInfo) {
    this.monthNames = [''].concat(localeInfo.monthNames);
    this.weekDays = [''].concat(localeInfo.weekDays);
    this.monthNamesShort = this.monthNames.map(str => str.slice(0, 3));
    this.weekDaysShort = this.weekDays.map(str => str.slice(0, 3));
    this.ordinalSuffixes = getOrdinalSuffixes(localeInfo.getOrdinal);
    this.ordinals = getOrdinals(localeInfo.getOrdinal);
    this.monthNumbers = createMap(this.monthNames);
    this.monthNumbersShort = createMap(this.monthNamesShort);
  }
}
