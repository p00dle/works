import { locales, LocaleData, LocaleName } from './locales';
import { hourToStringPadded, hourToString, daysSince1970,
  isLeapYear, daysUpToMonth, daysUpToMonthLeap, getWeekday,
  numberToString, numberToStringPadded2, numberToStringPadded3, isDST, dayCount,
  dayCountLeap, DST, getLocalTimezoneOffset, getLocalDST, DateData, getLastMonday } from './misc';

export { DST, isDST, getWeekday };

const variables: Record<string, Record<string, string>> = {
  year:         { full: 'YYYY', short: 'YY' },
  quarter:      {                             numericPadded: 'QQ',  numeric: 'Q' },
  month:        { full: 'MMMM', short: 'MMM', numericPadded: 'MM',  numeric: 'M' },
  day:          {                             numericPadded: 'DD',  numeric: 'D', ordinal: 'DDD' },
  weekday:      { full: 'WWWW', short: 'WWW' },
  hours:        {                             numericPadded: 'HH',  numeric: 'H' },
  minutes:      {                             numericPadded: 'mm',  numeric: 'm' },
  seconds:      {                             numericPadded: 'SS',  numeric: 'S' },
  milliseconds: {                             numericPadded: 'sss', numeric: 's' },
  ampm:         { full: 'AM' }
};

const formatInfo: {[str: string]: {type: VariableType; format: FormatType}} = (() => {
  const output: Record<string, { type: VariableType; format: FormatType }> = {};
  for (const type of (Object.keys(variables) as VariableType[])) {
    for (const format of (Object.keys(variables[type]) as FormatType[])) {
      output[variables[type][format] as string] = { type, format };
    }
  }
  return output;
})();

const formatRegex = /(YYYY)|(YY)|(QQ)|(Q)|(MMMM)|(MMM)|(MM)|(AM)|(M)|(DDDD)|(DDD)|(DD)|(D)|(WWWW)|(WWW)|(HH)|(H)|(mm)|(m)|(SS)|(S)|(sss)|(s)|[^YQMDWHmASs]+/g;

// const variableNames = [ 'year', 'month', 'day', 'weekday', 'hours', 'minutes', 'seconds', 'milliseconds', 'ampm' ];
// const types = [ 'full', 'short', 'numeric' , 'numericPadded', 'ordinal' ];

type FormatType =
  | 'full'
  | 'short'
  | 'numeric'
  | 'numericPadded'
  | 'ordinal';

type VariableType =
  | 'year'
  | 'month'
  | 'quarter'
  | 'day'
  | 'weekday'
  | 'hours'
  | 'hoursAmpm'
  | 'minutes'
  | 'seconds'
  | 'milliseconds'
  | 'ampm'
  | 'delimiter';

export interface DateXOptions {
  format?: string;
  locale?: LocaleName;
  timezoneOffset?: number | 'local';
  dst?: DST;
}

const defaultOptions: DateXOptions = {
  format: 'YYYY-MM-DDTHH:mm:SS.sssZ',
  locale: 'en',
  timezoneOffset: 0,
  dst: 'none'
};

const now = () => Date.now();
const today = () => {
  const now = Date.now();
  const time = now % 86400000;
  return now - time;
};
const toDate = (n: number) => n - (n % 86400000);
const days = (n: number) => n * 86400000;
const hours = (n: number) => n * 3600000;
const minutes = (n: number) => n * 60000;
const seconds = (n: number) => n * 1000;

type PeriodType = 'years' | 'quarters' | 'months' | 'weeks' | 'days' | 'hours' | 'minutes' | 'seconds';

export class DateX {
  public static range = {
    days: (from: number, to: number, include = false): number[] => {
      const result = [];
      let current = from;
      while (include ? current <= to : current < to) {
        result.push(current);
        current += 86400000;
      }
      return result;
    }
  };
  public static now = now;
  public static today = today;
  public static toDate = toDate;
  public static days = days;
  public static hours = hours;
  public static minutes = minutes;
  public static seconds = seconds;

  public static getLast(type: PeriodType, count: number, includeThis = false): number[] {
    const output = [];
    if (type === 'years') {
      const today = new Date();
      let date = new Date(Date.UTC(today.getFullYear() - (includeThis ? 0 : 1) - (count - 1), 0, 1));
      while (count--) {
        output.push(+date);
        date = new Date(Date.UTC(date.getFullYear() + 1, 0, 1));
      }
    } else if (type === 'quarters') {
      const today = new Date();
      let date = new Date(Date.UTC(today.getFullYear(), Math.floor(today.getMonth() / 3) - (includeThis ? 0 : 3) - (count - 1) * 3, 1));
      while (count--) {
        output.push(+date);
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 3, 1));
      }
    } else if (type === 'months') {
      const today = new Date();
      let date = new Date(Date.UTC(today.getFullYear(), today.getMonth() - (includeThis ? 0 : 1) - (count - 1), 1));
      while (count--) {
        output.push(+date);
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth() + 1, 1));
      }
    } else if (type === 'weeks') {
      let date = getLastMonday() - (includeThis ? 0 : 604800000) - (count - 1) * 604800000;
      while (count--) {
        output.push(date);
        date = date + 604800000;
      }
    } else if (type === 'days') {
      let date = today() - (includeThis ? 0 : 86400000) - (count - 1) * 86400000;
      while (count--) {
        output.push(date);
        date = date + 86400000;
      }
      
    } else if (type === 'hours') {
      //
    } else if (type === 'minutes') {
      //
    } else if (type === 'seconds') {
      //
    }
    return output;
  }

  private format: string;
  private locale: LocaleData;
  private timezoneOffsetMs: number;
  private timezoneOffset: number;
  private dst: DST;
  private formats: {type: VariableType; format?: FormatType; str?: string}[];
  private parseRegex: RegExp;
  private hours12: boolean;

  constructor(options: DateXOptions = defaultOptions) {
    this.format = options.format || 'YYYY-DD-MMTHH:mm:SS.sssZ';
    this.locale = options.locale ? locales[options.locale] || locales.en : locales.en;
    this.timezoneOffset = options.timezoneOffset !== undefined
      ? options.timezoneOffset === 'local'
        ? getLocalTimezoneOffset()
        : options.timezoneOffset
      : 0;
    this.timezoneOffsetMs = this.timezoneOffset * 3600000;
    this.dst = options.dst !== undefined
      ? options.dst === 'local' ? getLocalDST() : options.dst
      : 'none';
    this.hours12 = false;
    this.formats = [];
    const regexChunks: string[] = [];
    this.format.replace(formatRegex, (str: string) => {
      const info = formatInfo[str];
      if (!info) {
        this.formats.push({type: 'delimiter', str});
      } else if (info.type === 'hours' && this.format.includes('AM')) {
        this.formats.push({type: 'hoursAmpm', format: info.format});
      } else {
        this.formats.push({type: info.type, format: info.format});
      }

      if (!info) {
        regexChunks.push(str);
      } else {
        switch (info.type) {
          case 'year':
            if (info.format === 'full') {
              regexChunks.push('\\d\\d\\d\\d');
            } else if (info.format === 'short') {
              regexChunks.push('\\d\\d');
            }
            break;
          case 'quarter':
            if (info.format === 'numericPadded') {
              regexChunks.push('\\d\\d');
            } else if (info.format === 'numeric') {
              regexChunks.push('\\d');
            }
            break;
          case 'month':
            if (info.format === 'full') {
              regexChunks.push(this.locale.monthNames.slice(1).join('|'));
            } else if (info.format === 'short') {
              regexChunks.push(this.locale.monthNamesShort.slice(1).join('|'));
            } else if (info.format === 'numeric') {
              regexChunks.push('\\d{1,2}');
            } else if (info.format === 'numericPadded') {
              regexChunks.push('\\d\\d');
            }
            break;
          case 'day':
            if (info.format === 'ordinal') {
              regexChunks.push(this.locale.ordinals.slice(1).join('|'));
            } else if (info.format === 'numeric') {
              regexChunks.push('\\d{1,2}');
            } else if (info.format === 'numericPadded') {
              regexChunks.push('\\d\\d');
            }
            break;
          case 'hours':
          case 'minutes':
          case 'seconds':
            if (info.format === 'numeric') {
              regexChunks.push('\\d{1,2}');
            } else if (info.format === 'numericPadded') {
              regexChunks.push('\\d\\d');
            }
            break;
          case 'milliseconds':
            if (info.format === 'numeric') {
              regexChunks.push('\\d{1,3}');
            } else if (info.format === 'numericPadded') {
              regexChunks.push('\\d\\d\\d');
            }
            break;
          case 'ampm':
            regexChunks.push('am|pm');
            break;
        }
      }
      return '';
    });
// tslint:disable-next-line: tsr-detect-non-literal-regexp
    this.parseRegex = new RegExp(regexChunks.map(chunk => '(' + chunk + ')').join(''), 'i');
  }

  public getData(num: number): DateData {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    n = (n - minutes) / 60;
    let hours = n % 24;
    n = (n - hours) / 24;
    const yearsSince1970 = (n / 365.24) | 0;
    const year = yearsSince1970 + 1970;
    const leapYear = isLeapYear(year);
    const daysToBeginningOfYear = daysSince1970[yearsSince1970];
    const daysSinceBeginningOfYear = n - daysToBeginningOfYear;

    let month = 1;
    const daysToBegginingOfMonth = leapYear ? daysUpToMonthLeap : daysUpToMonth;
    while (daysSinceBeginningOfYear >= daysToBegginingOfMonth[month]) {
      month++;
    }
    month--;
    let day = daysSinceBeginningOfYear - daysToBegginingOfMonth[month] + 1;
    const isDst = this.dst === 'none' ? false : isDST(this.dst, yearsSince1970, month, day, hours - this.timezoneOffset);
    if (isDst) {
      if (isDST(this.dst, yearsSince1970, month, day, hours - this.timezoneOffset)) {
        hours++;
        if (hours === 24) {
          hours = 0;
          day++;
          if (day > (leapYear ? dayCountLeap : dayCount)[month]) {
            month++;
            day = 1;
          }
        }
      }
    }
    const quarter = Math.floor((month - 1) / 3) + 1;
    const weekday = getWeekday(year, month, day);
    return { year, quarter, month, day, hours, minutes, seconds, milliseconds, isDst, weekday };
  }

  public toUTC(n: number): number {
    const data = this.getData(n);
    return n - this.timezoneOffsetMs + (data.isDst ? 3600000 : 0);

  }

  public today(): number {
    const todayUtc = today();
    const todayTz = todayUtc - this.timezoneOffsetMs;
    const { isDst } = this.getData(todayTz);
    return isDst ? todayTz + 3600000 : todayTz;
  }

  public yesterday(): number {
    const todayUtc = today();
    const todayTz = todayUtc - this.timezoneOffsetMs - 86400000;
    const { isDst } = this.getData(todayTz);
    return isDst ? todayTz + 3600000 : todayTz;
  }

  public tomorrow(): number {
    const todayUtc = today();
    const todayTz = todayUtc - this.timezoneOffsetMs + 86400000;
    const { isDst } = this.getData(todayTz);
    return isDst ? todayTz + 3600000 : todayTz;
  }
  
  public fromDateData(data: DateData): number {
    const yearsSince1970 = data.year - 1970;
    const offsetHours = data.hours - this.timezoneOffset;
    const isDst = this.dst === 'none' ? false : isDST(this.dst, yearsSince1970, data.month, data.day, offsetHours);
    return (isDst ? 3600000 : 0) + 
      ( daysSince1970[yearsSince1970] + (isLeapYear(data.year) ? daysUpToMonthLeap[data.month] : daysUpToMonth[data.month]) ) * 86400000 + 
      (data.day - 1) * 86400000 +
      offsetHours * 3600000 +
      data.minutes * 60000 + 
      data.seconds * 1000 +
      data.milliseconds;

  }

  public stringify(num: number): string {
    if (typeof num !== 'number' || isNaN(num)) return '';
    const { year, quarter, month, day, hours, minutes, seconds, milliseconds } = this.getData(num);
    const chunks = this.formats.map((format): string => {
      switch (format.type) {
        case 'delimiter':
          return format.str !== undefined ? format.str : '';
        case 'year':
          if (format.format === 'short') {
            return '' + (year % 100);
          } else {
            return '' + year;
          }
        case 'quarter':
          return (format.format === 'numericPadded' ? '0' : '') + quarter;
        case 'month':
          if (format.format === 'full') {
            return this.locale.monthNames[month];
          } else if (format.format === 'short') {
            return this.locale.monthNamesShort[month];
          } else if (format.format === 'numeric') {
            return numberToString[month];
          } else {
            return numberToStringPadded2[month];
          }
        case 'day':
          if (format.format === 'numeric') {
            return numberToString[day];
          } else if (format.format === 'ordinal') {
            return this.locale.ordinals[day];
          } else {
            return numberToStringPadded2[day];
          }
        case 'weekday':
          if (format.format === 'short') {
            return this.locale.weekDaysShort[getWeekday(year, month, day)];
          } else {
            return this.locale.weekDays[getWeekday(year, month, day)];
          }
        case 'hours':
          if (format.format === 'numeric') {
            return numberToString[hours];
          } else {
            return numberToStringPadded2[hours];
          }
        case 'hoursAmpm':
          if (format.format === 'numeric') {
            return hourToString[hours];
          } else {
            return hourToStringPadded[hours];
          }
        case 'minutes':
          if (format.format === 'numeric') {
            return numberToString[minutes];
          } else {
            return numberToStringPadded2[minutes];
          }
        case 'seconds':
          if (format.format === 'numeric') {
            return numberToString[seconds];
          } else {
            return numberToStringPadded2[seconds];
          }
        case 'milliseconds':
          if (format.format === 'numeric') {
            return numberToString[milliseconds];
          } else {
            return numberToStringPadded3[milliseconds];
          }
        case 'ampm':
          this.hours12 = true;
          return hours < 12 ? 'AM' : 'PM';
      }
    });
    return chunks.join('');

  }
  public parse(dateStr: string): number {
    const match = dateStr.match(this.parseRegex);
    if (!match) {
      return NaN;
    }
    let year = 1970;
    let month = 1;
    let day = 1;
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    let milliseconds = 0;
    let isPM = false;
    const matches: string[] = Array.prototype.slice.call(match, 1);
    for (let i = 0, l = matches.length; i < l; i++) {
      const str = matches[i];
      const format = this.formats[i];
      switch (format.type) {
        case 'delimiter':
          break;
        case 'year':
          year = +str + (format.format === 'full' ? 0 : 2000);
          break;
        case 'month':
          if (format.format === 'full') {
            month = this.locale.monthNumbers[str.toLowerCase()];
          } else if (format.format === 'short') {
            month = this.locale.monthNumbersShort[str.toLowerCase()];
          } else {
            month = +str;
          }
          break;
        case 'day':
          day = format.format === 'ordinal' ? parseInt(str, 10) : +str;
          break;
        case 'hours':
        case 'hoursAmpm':
          hours = +str;
          break;
        case 'minutes':
          minutes = +str;
          break;
        case 'seconds':
          seconds = +str;
          break;
        case 'milliseconds':
          milliseconds = +str;
          break;
        case 'ampm':
          isPM = str.toLowerCase() === 'pm';
          break;
      }
    }
    const yearsSince1970 = year - 1970;
    return (
      daysSince1970[yearsSince1970] +
      (isLeapYear(year) ? daysUpToMonthLeap : daysUpToMonth)[month] +
      day - 1
    ) * 86400000 +
      (this.hours12
        ? (isPM ? 12 : 0) + (hours === 12 ? 0 : hours * 3600000)
        : hours * 3600000) +
      minutes * 60000 +
      seconds * 1000 +
      milliseconds -
      this.timezoneOffsetMs -
      (isDST(this.dst, yearsSince1970, month, day, hours) ? 3600000 : 0);
  }

  public getYear(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    n = (n - minutes) / 60;
    const hours = n % 24;
    n = (n - hours) / 24;
    const yearsSince1970 = (n / 365.24) | 0;
    const year = yearsSince1970 + 1970;
    return year;
  }
  public getMonth(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    n = (n - minutes) / 60;
    const hours = n % 24;
    n = (n - hours) / 24;
    const yearsSince1970 = (n / 365.24) | 0;
    const year = yearsSince1970 + 1970;
    const leapYear = isLeapYear(year);
    const daysToBeginningOfYear = daysSince1970[yearsSince1970];
    const daysSinceBeginningOfYear = n - daysToBeginningOfYear;

    let month = 1;
    const daysToBegginingOfMonth = leapYear ? daysUpToMonthLeap : daysUpToMonth;
    while (daysSinceBeginningOfYear >= daysToBegginingOfMonth[month]) {
      month++;
    }
    month--;
    return month;
  }
  public getDay(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    n = (n - minutes) / 60;
    let hours = n % 24;
    n = (n - hours) / 24;
    const yearsSince1970 = (n / 365.24) | 0;
    const year = yearsSince1970 + 1970;
    const leapYear = isLeapYear(year);
    const daysToBeginningOfYear = daysSince1970[yearsSince1970];
    const daysSinceBeginningOfYear = n - daysToBeginningOfYear;

    let month = 1;
    const daysToBegginingOfMonth = leapYear ? daysUpToMonthLeap : daysUpToMonth;
    while (daysSinceBeginningOfYear >= daysToBegginingOfMonth[month]) {
      month++;
    }
    month--;
    let day = daysSinceBeginningOfYear - daysToBegginingOfMonth[month] + 1;
    if (this.dst !== 'none') {
      if (isDST(this.dst, yearsSince1970, month, day, hours - this.timezoneOffset)) {
        hours++;
        if (hours === 24) {
          hours = 0;
          day++;
          if (day > (leapYear ? dayCountLeap : dayCount)[month]) {
            month++;
            day = 1;
          }
        }
      }
    }
    return day;
  }
  public getHours(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    n = (n - minutes) / 60;
    let hours = n % 24;
    n = (n - hours) / 24;
    const yearsSince1970 = (n / 365.24) | 0;
    const year = yearsSince1970 + 1970;
    const leapYear = isLeapYear(year);
    const daysToBeginningOfYear = daysSince1970[yearsSince1970];
    const daysSinceBeginningOfYear = n - daysToBeginningOfYear;

    let month = 1;
    const daysToBegginingOfMonth = leapYear ? daysUpToMonthLeap : daysUpToMonth;
    while (daysSinceBeginningOfYear >= daysToBegginingOfMonth[month]) {
      month++;
    }
    month--;
    let day = daysSinceBeginningOfYear - daysToBegginingOfMonth[month] + 1;
    if (this.dst !== 'none') {
      if (isDST(this.dst, yearsSince1970, month, day, hours - this.timezoneOffset)) {
        hours++;
        if (hours === 24) {
          hours = 0;
          day++;
          if (day > (leapYear ? dayCountLeap : dayCount)[month]) {
            month++;
            day = 1;
          }
        }
      }
    }
    return hours;
  }
  public getMinutes(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    n = (n - seconds) / 60;
    const minutes = n % 60;
    return minutes;
  }
  public getSeconds(num: number): number {
    let n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    n = (n - milliseconds) / 1000;
    const seconds = n % 60;
    return seconds;
  }
  public getMilliseconds(num: number): number {
    const n = num + this.timezoneOffsetMs;
    const milliseconds = n % 1000;
    return milliseconds;
  }

  public fromUTC(n: number): number {
    const data = this.getData(n);
    return n + this.timezoneOffsetMs + (data.isDst ? 3600000 : 0);
  }
}
