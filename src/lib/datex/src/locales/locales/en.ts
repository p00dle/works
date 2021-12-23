import { LocaleInfo } from '../interface';

export const locale: LocaleInfo = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  weekDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  getOrdinal: (day: number): string => {
    if (day >= 10 && day <= 13) {
      return 'th';
    }
    const ones = day % 10;
    if (ones === 1) {
      return 'st';
    } else if (ones === 2) {
      return 'nd';
    } else if (ones === 3) {
      return 'rd';
    } else {
      return 'th';
    }
  }
};
