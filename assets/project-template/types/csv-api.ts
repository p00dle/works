import type { UserCsvApi } from '~/components/user/csv-endpoints';

import type { CsvApiParser } from 'works';

export type CsvApi = CsvApiParser<
  & { }
  &  UserCsvApi
>;