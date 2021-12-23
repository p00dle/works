import { LocaleData } from './locale';
import { locale as en } from './locales/en';

export { LocaleData } from './locale';

export type LocaleName =
  | 'en'
;

export const locales: {[locale: string]: LocaleData} = {
  en: new LocaleData(en)
};
