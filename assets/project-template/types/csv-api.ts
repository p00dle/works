import type { UserCsvApi } from '~/components/user/csv-endpoints';
import type { UserTelemetryLogsCsvApi } from '~/components/user-telemetry-log/csv-endpoints';
// @works:next_import

export type CsvApi = 
  & { }
  & UserCsvApi
  & UserTelemetryLogsCsvApi
  // @works:next_value
;
