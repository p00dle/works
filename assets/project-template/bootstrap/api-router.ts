import type { Endpoints } from 'works';

import { Router } from 'express';
import { bootstrapApiRouter } from 'works';
import { isProduction, bypassAuthentication, bypassAuthorisation} from '~/bootstrap/global-env-vars';
import { logger } from '~/bootstrap/logger';

import { userEndpoints } from '~/components/user/http-endpoints';
import { localAuthEndpoints } from '~/services/local-auth/http-endpoints';
// @works:next_import

export const apiRouter = Router();

const endpoints: Endpoints[] = [
  userEndpoints,
  localAuthEndpoints
  // @works:next_route
]

bootstrapApiRouter({
  apiRouter,
  isProduction,
  bypassAuthentication,
  bypassAuthorisation,
  endpoints,
  logger,
});