import type { CsvEndpoints } from 'works';

import { Router } from 'express';
import { bootstrapCsvRouter } from 'works';
import { isProduction, bypassAuthentication, bypassAuthorisation} from '~/bootstrap/global-env-vars';
import { logger } from '~/bootstrap/logger';

import { userCsvEndpoints } from '~/components/user/csv-endpoints';
// @works:next_import

export const csvRouter: Router = Router();

const endpoints: CsvEndpoints[] = [
  userCsvEndpoints,
  // @works:next_route
]

bootstrapCsvRouter({
  csvRouter,
  isProduction,
  bypassAuthentication,
  bypassAuthorisation,
  endpoints,
  logger,
});