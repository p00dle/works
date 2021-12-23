export interface LocaleInfo {
  getOrdinal: (n: number) => string;
  monthNames: string[];
  weekDays: string[];
}
