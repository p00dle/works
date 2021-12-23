export type DST =
  | 'none'
  | 'eu'
  | 'us'
  | 'local'
;

export interface DateData {
  year: number;
  quarter: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  isDst: boolean;
  weekday: number;
}

export const hourToString = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11',
'12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
export const hourToStringPadded = ['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11',
'12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
export const dayCount =      [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const dayCountLeap =  [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export const [numberToString, numberToStringPadded2, numberToStringPadded3] = ((): [string[], string[], string[]] => {
  const numsVar = [];
  const nums2 = [];
  const nums3 = [];
  for (let i = 0, l = 1000; i < l; i++) {
    numsVar[i] = '' + i;
    if (i < 10) {
      nums2[i] = '0' + i;
      nums3[i] = '00' + i;
    } else if (i < 100) {
      nums2[i] = '' + i;
      nums3[i] = '0' + i;
    } else {
      nums3[i] = '' + i;
    }
  }
  return [numsVar, nums2, nums3];
})();

export function isLeapYear(year: number): boolean {
  if (year % 4 !== 0) {
    return false;
  }
  if (year % 100 !== 0) {
    return true;
  }
  return year % 400 === 0;
}

export function getWeekday(year: number, month: number, day: number): number {
  const m = month;
  const y = m < 3 ? year - 1 : year;
  const d = day;
  const r = (y + ((y / 4) | 0) - ((y / 100) | 0) + ((y / 400) | 0) + [0, 0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4][m] + d) % 7;
  return r === 0 ? 7 : r;
}

function mar1wd(y: number): number {
  const r = (y + ((y / 4) | 0) - ((y / 100) | 0) + ((y / 400) | 0) + 3) % 7;
  return r === 0 ? 7 : r;
}

const mar1wdCache = ((): number[] => {
  const cache = [];
  for (let i = 0, l = 365; i < l; i++) {
    cache[i] = mar1wd(1970 + i);
  }
  return cache;
})();

export function isDST(dst: DST, yearsSince1970: number, month: number, day: number, hour: number): boolean {
  if (dst === 'us') {
    if (month > 3 && month < 11) {
      return true;
    }
    if (month === 3) {
      return day * 24 + hour >=  (15 - mar1wdCache[yearsSince1970]) * 24 + 2;
    } else if (month === 11) {
      return day * 24 + hour <   (8 -  mar1wdCache[yearsSince1970]) * 24 + 2;
    } else {
      return false;
    }
  } else if (dst === 'eu') {
    if (month > 3 && month < 10) {
      return true;
    }
    if (month === 3) {
      return day * 24 + hour >=  (31 - (mar1wdCache[yearsSince1970] + 2) % 7) * 24 + 1;
    } else if (month === 10) {
      return day * 24 + hour <   (32 - mar1wdCache[yearsSince1970]) * 24 + 1;
    } else {
      return false;
    }
  }
  return false;
}

export const daysSince1970 = ((): number[] => {
  const days = [];
  let sum = 0;
  for (let i = 0, l = 1030; i < l; i++) {
    days[i] = sum;
    sum += isLeapYear(1970 + i) ? 366 : 365;
  }
  return days;
})();

export const [daysUpToMonth, daysUpToMonthLeap] = ((): [number[], number[]] => {
  let sum = 0;
  let sumLeap = 0;
  const arr = [0, 0];
  const arrLeap = [0, 0];
  for (let i = 1; i < 13; i++) {
    arr.push(sum += dayCount[i]);
    arrLeap.push(sumLeap += dayCountLeap[i]);
  }
  return [arr, arrLeap];
})();

export const getLocalTimezoneOffset = (): number => {
  const date = new Date();
  const jan = new Date(date.getFullYear(), 0, 1);
  return jan.getTimezoneOffset() / 60;
};

export const getLocalDST = (): DST => {
  return 'none';
  // TODO: add local DST detection
};

export function getLastMonday(): number {
  const now = new Date();
  const nowN = +now;
  const day = now.getDay();
  const today = nowN - (nowN % 86400000);
  const subtractDays = day === 0 ? 6 : (day - 1);
  return today - (subtractDays * 86400000);
}
