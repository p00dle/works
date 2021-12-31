import { Router } from 'express';
import { bootstrapApiRouter } from 'works';
import { isProduction, bypassAuthentication, bypassAuthorisation} from '~/bootstrap/global-env-vars';
import { logger } from '~/bootstrap/logger';

import { userGetEndpoints, userPostEndpoints } from '~/components/user/http-endpoints';
import { localAuthGetEndpoints, localAuthPostEndpoints } from '~/services/local-auth/http-endpoints';
// @works:next_import

export const apiRouter: Router = Router();

const getEndpoints = [
  userGetEndpoints,
  localAuthGetEndpoints,
  // @works:next_get_endpoints
]

const postEndpoints = [
  userPostEndpoints,
  localAuthPostEndpoints,
  // @works:next_post_endpoints
]


bootstrapApiRouter({
  apiRouter,
  isProduction,
  bypassAuthentication,
  bypassAuthorisation,
  getEndpoints,
  postEndpoints,
  logger,
});