import type { GetEndpoints, PostEndpoints, GetEndpoint, PostEndpoint } from '../types/endpoint';
import type { Logger } from '../types/logger';

import { Router } from 'express';
import { worksEvents } from '../factories/works-events';
import { ApiError, queryParserFactory, isAuthenticated, isAuthorisedFactory } from '../lib/express-middlewares';
import { ExpressHandler, QueryType } from '../types/_common';
import { expressLoggerFactory } from './express-logger';
import { isLogger } from './logger';


function controllerWrapper(controller: (query: QueryType<any>, payload: any | void) => Promise<any>): ExpressHandler {
  return async (req, res) => {
    try {
      const response = await controller(req.query, req.body);
      res.statusCode = 200;
      res.json(response === undefined ? 'OK' : response);
    } catch (error) {
      if (error instanceof ApiError) {
        res.statusCode = error.httpErrorCode;
        res.json(error.message);
      } else {
        worksEvents.publish('works', 'server-error', error);
        res.statusCode = 500;
        res.json('Unknown server error');
      }
    }
  }
}

interface BootStrapApiRouterParams {
  apiRouter: Router;
  isProduction: boolean;
  bypassAuthentication: boolean;
  bypassAuthorisation: boolean;
  getEndpoints: GetEndpoints[];
  postEndpoints: PostEndpoints[];
  logger?: Logger;
}

export const bootstrapApiRouter = function httpRouterFactory({apiRouter, isProduction, bypassAuthentication, bypassAuthorisation, getEndpoints, postEndpoints, logger}: BootStrapApiRouterParams) {
  function addRoute(method: 'get' | 'post', route: string, endpoint: GetEndpoint<any, any> | PostEndpoint<any, any, any> ) {
    const handlers: ExpressHandler[] = [];
    if (isLogger(logger) && logger.shouldLog('debug'))  handlers.push(expressLoggerFactory(logger, 'Works.Api'));
    if (!bypassAuthentication || endpoint.accessControl !== 'allow-unauthenticated') handlers.push(isAuthenticated);
    if (endpoint.query) handlers.push(queryParserFactory(endpoint.query));
    if (!bypassAuthorisation && endpoint.accessControl && endpoint.accessControl !== 'allow-unauthenticated') handlers.push(isAuthorisedFactory(endpoint.accessControl));
    if (Array.isArray(endpoint.middleware)) endpoint.middleware.forEach(handler => handlers.push(handler));
    handlers.push(controllerWrapper(endpoint.controller));
    apiRouter[method](route, handlers);
  }
  for (const componentEndpoints of getEndpoints) {
    for (const [route, endpoint] of Object.entries(componentEndpoints)) {
      addRoute('get', route, endpoint);
    }
  }
  for (const componentEndpoints of postEndpoints) {
    for (const [route, endpoint] of Object.entries(componentEndpoints)) {
      addRoute('post', route, endpoint);
    }
  }
}
