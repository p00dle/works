import type { QueryParams, QueryType, ExpressHandler } from '../types/_common';
import type { Router } from 'express';
import type { CsvEndpoint, CsvEndpoints, CsvColumn } from '../types/csv-endpoint';
import type { Logger } from '../types/logger';

import * as csv from 'fast-csv';
import { csvTransformFactory } from '../lib/csv-transform';
import { DateX } from '../lib/datex';
import { isAuthenticated, isAuthorisedFactory, queryParserFactory } from '../lib/express-middlewares';
import { expressLoggerFactory } from './express-logger';
import { isLogger } from './logger';

function getTimezoneOffsetAndDstFromQuery(query: QueryType<any>): [number, 'none' | 'eu' | 'us'] {
  const { timezoneOffset, dst } = query;
  return [
    typeof timezoneOffset === 'string' ? +timezoneOffset : 0,
    typeof dst === 'string' && ['none', 'eu', 'us'].includes(dst) ? dst as 'none' | 'eu' | 'us' : 'none'
  ]
}

function getHeadersFromColumns(columns: CsvColumn<any>[]): string {
  return columns.map(col => col.type === 'custom' ? col.label : col.label || col.prop).join(',') + '\n';
}

function controllerWrapper<Q extends QueryParams,T>(endpoint: CsvEndpoint<Q,T>): ExpressHandler {
  return async (req, res) => {
    const reqQuery = req.query as QueryType<Q>;
    const columns = typeof endpoint.columns === 'function' ? endpoint.columns(reqQuery) : endpoint.columns;
    const transformFactory = csvTransformFactory(columns);
    const headersString = getHeadersFromColumns(columns);
    const [timezoneOffset, dst] = getTimezoneOffsetAndDstFromQuery(reqQuery);
    const [datexDate, datexDateTime] = [new DateX({format: 'YYYY-MM-DD', timezoneOffset, dst}), new DateX({format: 'YYYY-MM-DD HH:mm:SS', timezoneOffset, dst})];
    const inputStream = await endpoint.controller(reqQuery);
    const transformStream = csv.format().transform(transformFactory(datexDate, datexDateTime))
    req.on('close', () => inputStream.destroy());
    res.attachment(typeof endpoint.filename === 'function' ? endpoint.filename(reqQuery) : endpoint.filename);
    res.write(headersString);
    inputStream.pipe(transformStream).pipe(res);
    // TODO: add error handling
  }
}

interface BootStrapApiRouterParams {
  csvRouter: Router;
  isProduction: boolean;
  bypassAuthentication: boolean;
  bypassAuthorisation: boolean;
  endpoints: CsvEndpoints[];
  logger?: Logger;
}

export const bootstrapCsvRouter = function csvRouterFactory({csvRouter, isProduction, bypassAuthentication, bypassAuthorisation, endpoints, logger}: BootStrapApiRouterParams) {
  
  for (const componentEndpoints of endpoints) {
    for (const [path, endpoint] of Object.entries(componentEndpoints)) {
        const handlers: ExpressHandler[] = [];
        if (isLogger(logger) && logger.shouldLog('debug'))  handlers.push(expressLoggerFactory(logger, 'Works.Api'));
        if (!bypassAuthentication) handlers.push(isAuthenticated);
        if (endpoint.query) handlers.push(queryParserFactory(endpoint.query));
        if (!bypassAuthorisation && endpoint.accessControl) handlers.push(isAuthorisedFactory(endpoint.accessControl));
        handlers.push(controllerWrapper(endpoint));
        csvRouter.get(path, handlers);
      }
  }
}