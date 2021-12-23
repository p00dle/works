import { DateX, DateXOptions } from './date';
import { isLeapYear, daysUpToMonthLeap, daysUpToMonth } from './misc';

type ShortDate = [number, number, number];

// const weekMs = DateX.days(7);

export function getWeekday(date: ShortDate): number {
  const [ year, m, d ] = date;
  const y = m < 3 ? year - 1 : year;
  const r = (y + ((y / 4) | 0) - ((y / 100) | 0) + ((y / 400) | 0) + [0, 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4][m] + d) % 7;
  return r;
}

export function getWeekNumber(date: ShortDate): number {
  const [ year, month, day] = date;
  const firstDayOfYear: ShortDate = [year, 1 , 1];
  const firstDayOfWeek2: ShortDate = [year, 1, 8 - getWeekday(firstDayOfYear)];
  const leapYear = isLeapYear(year);
  const daysUpToMonth2 = leapYear ? daysUpToMonthLeap : daysUpToMonth;
  const dateDays = daysUpToMonth2[month] + day;
  const firstDayOfWeek2Days = daysUpToMonth2[firstDayOfWeek2[1]] + firstDayOfWeek2[2];
  return 2 + Math.floor((dateDays - firstDayOfWeek2Days) / 7 + 0.1);
}

export function daysToEndOfYear(date: ShortDate): number {
  const [year, month, day] = date;
  const leapYear = isLeapYear(year);
  const daysInYear = leapYear ? 366 : 365;
  const daysUpToMonth2 = leapYear ? daysUpToMonthLeap : daysUpToMonth;
  return daysInYear - (daysUpToMonth2[month] + day);
}
export function daysFromStartOfYear(date: ShortDate): number {
  const [year, month, day] = date;
  const leapYear = isLeapYear(year);
  const daysUpToMonth2 = leapYear ? daysUpToMonthLeap : daysUpToMonth;
  return daysUpToMonth2[month] + day;
}

const weekNumberOfFirstOfAugustCache: {[year: string]: number} = {};
const weekDayOfFirstOfAugustCache: {[year: string]: number} = {};
export function getFirstFYDay(date: ShortDate): ShortDate {
  let [year] = date;
  let weekNumberOfFirstOfAugust = weekNumberOfFirstOfAugustCache[year];
  if (weekNumberOfFirstOfAugust === undefined) {
    weekNumberOfFirstOfAugust = weekNumberOfFirstOfAugustCache[year] = getWeekNumber([year, 8, 1]);
  }
  if (weekNumberOfFirstOfAugust > getWeekNumber(date)) {
    year--;
  }
  let weekDayOfFirstOfAugust = weekDayOfFirstOfAugustCache[year];
  if (weekDayOfFirstOfAugust === undefined) {
    weekDayOfFirstOfAugust = weekDayOfFirstOfAugustCache[year] = getWeekday([year, 8, 1]);
  }
  return weekDayOfFirstOfAugust === 0 ? [year, 8, 1] : [year, 7, 32 - weekDayOfFirstOfAugust];

}

export function isExceptionalYear(date: ShortDate): boolean {
  return Math.floor((daysToEndOfYear(date) + daysFromStartOfYear([date[0] + 1, 8, 1])) / 7) === 53;
}

export interface FiscalData {
  fiscalYear: number;
  fiscalQuarter: number;
  fiscalMonth: number;
  fiscalWeek: number;
  fiscalDay: number;

}

const monthQuarterMap = [0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4];

export class FiscalDateX extends DateX {
  private fiscalDataCache: { [num: number]: FiscalData } = {};

  constructor(options?: DateXOptions) {
    super(options);
  }
  public getFiscalData(num: number): FiscalData {
    if (this.fiscalDataCache[num]) return this.fiscalDataCache[num];
    const dateData = this.getData(num);
    const date: ShortDate = [dateData.year, dateData.month, dateData.day];
    const firstFYDay = getFirstFYDay(date);
    const fiscalDay = date[0] === firstFYDay[0]
      ? daysFromStartOfYear(date) - daysFromStartOfYear(firstFYDay)
      : daysFromStartOfYear(date) + daysToEndOfYear(firstFYDay);
    const fiscalWeek = Math.ceil((fiscalDay + 1) / 7);
    let fiscalMonth: number;
    if      (fiscalWeek <= 4)  fiscalMonth = 1;
    else if (fiscalWeek <= 8)  fiscalMonth = 2;
    else if (fiscalWeek <= 13) fiscalMonth = 3;
    else if (fiscalWeek <= 17) fiscalMonth = 4;
    else if (fiscalWeek <= 21) fiscalMonth = 5;
    else if (fiscalWeek <= 26) fiscalMonth = 6;
    else if (isExceptionalYear(firstFYDay)) {
      if      (fiscalWeek <= 31)  fiscalMonth = 7;
      else if (fiscalWeek <= 35)  fiscalMonth = 8;
      else if (fiscalWeek <= 40)  fiscalMonth = 9;
      else if (fiscalWeek <= 44)  fiscalMonth = 10;
      else if (fiscalWeek <= 48)  fiscalMonth = 11;
      else                  fiscalMonth = 12;
    } else {
      if      (fiscalWeek <= 30)  fiscalMonth = 7;
      else if (fiscalWeek <= 34)  fiscalMonth = 8;
      else if (fiscalWeek <= 39)  fiscalMonth = 9;
      else if (fiscalWeek <= 43)  fiscalMonth = 10;
      else if (fiscalWeek <= 47)  fiscalMonth = 11;
      else                  fiscalMonth = 12;
    }
    const fiscalYear = firstFYDay[0] + 1;
    const fiscalQuarter = Math.ceil(fiscalMonth / 3);
    const fiscalData = { fiscalYear, fiscalQuarter, fiscalMonth, fiscalWeek, fiscalDay: fiscalDay + 1 };
    this.fiscalDataCache[num] = fiscalData;
    return fiscalData;
  }
  public getLastFiscalData(type: 'years' | 'quarters' | 'months' | 'weeks' | 'days', count: number, includeThis = false): FiscalData[] {
    const output = [];
    let date = Date.now();
    let data = this.getFiscalData(date);
    let thisSkipped = !includeThis;
    while (count--) {
      if (thisSkipped) {
        output.unshift(data);
      } else {
        thisSkipped = true;
        count++;
      }
      if (type === 'years') {
        data = {...data, fiscalYear: data.fiscalYear - 1};
      } else if (type === 'quarters') {
        data = data.fiscalQuarter === 1
          ? {...data, fiscalYear: data.fiscalYear - 1, fiscalQuarter: 4 }
          : {...data, fiscalQuarter: data.fiscalQuarter - 1 };
      } else if (type === 'months') {
        data = data.fiscalMonth === 1
          ? {...data, fiscalYear: data.fiscalYear - 1, fiscalQuarter: 4, fiscalMonth: 12}
          : {...data, fiscalQuarter: monthQuarterMap[data.fiscalMonth - 1], fiscalMonth: data.fiscalMonth - 1 };
      } else if (type === 'weeks') {
        date = date - DateX.days(7);
        data = this.getFiscalData(date);
      } else if (type === 'days') {
        date = date - DateX.days(1);
        data = this.getFiscalData(date);
      }
    }
    return output;
  }
  public getLastFiscal(periodType: keyof FiscalData, count: number, includeThis = false): number[] {
    const today = DateX.today();
    const day = DateX.days(1);
    const output = [];
    let [startDate, ] = this.getPeriod(today, periodType);
    if (includeThis) {
      count--;
      output.push(startDate);
    }
    let date = startDate;
    while (count--) {
      date = date - day;
      [startDate, ] = this.getPeriod(date, periodType);
      output.unshift(startDate);
      date = startDate;
    }
    return output;
  }
  public getPeriod(date: number, periodType: keyof FiscalData): [number, number] {
    const roundDate = DateX.toDate(date);
    const fiscalData = this.getFiscalData(roundDate);
    const day = DateX.days(1);
    const originalPeriod = fiscalData[periodType];
    let startDate: number = roundDate;
    let endDate: number = roundDate;
    let period: number = originalPeriod;
    while (period === originalPeriod) {
      startDate = startDate - day;
      period = this.getFiscalData(startDate)[periodType];
    }
    startDate = startDate + day;
    period = originalPeriod;
    while (period === originalPeriod) {
      endDate = endDate + day;
      period = this.getFiscalData(endDate)[periodType];
    }
    return [startDate, endDate];
  }
  public addFiscal(fiscalData: FiscalData, add: Partial<FiscalData>): FiscalData {
    return this.resolveFiscalData({
      fiscalYear: add.fiscalYear ? fiscalData.fiscalYear + add.fiscalYear : fiscalData.fiscalYear,
      fiscalQuarter: add.fiscalQuarter ? fiscalData.fiscalQuarter + add.fiscalQuarter : fiscalData.fiscalQuarter,
      fiscalMonth: add.fiscalMonth ? fiscalData.fiscalMonth + add.fiscalMonth : fiscalData.fiscalMonth,
      fiscalWeek: add.fiscalWeek ? fiscalData.fiscalWeek + add.fiscalWeek : fiscalData.fiscalWeek,
      fiscalDay: add.fiscalDay ? fiscalData.fiscalDay + add.fiscalDay : fiscalData.fiscalDay,
    });
  }
  public subtractFiscal(fiscalData: FiscalData, add: Partial<FiscalData>): FiscalData {
    return this.addFiscal(fiscalData, {
      fiscalYear: add.fiscalYear ? -add.fiscalYear : undefined,
      fiscalQuarter: add.fiscalQuarter ? -add.fiscalQuarter : undefined,
      fiscalMonth: add.fiscalMonth ? -add.fiscalMonth : undefined,
      fiscalWeek: add.fiscalWeek ? -add.fiscalWeek : undefined,
      fiscalDay: add.fiscalDay ? -add.fiscalDay : undefined
    });
  }
  private resolveFiscalData(fiscalData: FiscalData): FiscalData {
    return fiscalData;
  }
}
