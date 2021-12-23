import type { AccessControl, ExpressHandler, QueryParams, QueryType } from '../types/_common';
import { DateX } from './datex';
import { arrayToDict } from './utils';
import { Request } from 'express';
import { worksEvents } from '../factories/works-events';

function sanitizeString(str: string): string {
  // TODO add some sane sanitization
  return str;
}

export class ApiError extends Error {
  constructor(
    public httpErrorCode: number,
    public message: string
  ) {
    super(message);
  }
}


const date = new DateX({format: 'YYYY-MM-DD'});
const datetime = new DateX({format: 'YYYY-MM-DD HH:mm:SS'});
const parsersByType: Record<string, (str: string) => any> = {
  'string': str => sanitizeString(str),
  'string[]': str => str.split(',').map(sanitizeString),
  'number': str => +(str.replace(/[^\d]+/g, '')),
  'boolean': str => str.toLowerCase() === 'true',
  'date': str => date.parse(str),
  'datetime': str => datetime.parse(str),
}

function createQueryParser<Q extends QueryParams>(query: Q): (req: Request) => QueryType<Q> {
  const parsers: Record<string, (str: string) => any> = {};
  const props = Object.keys(query);
  for (const prop of props) {
    const type = query[prop];
    if (Array.isArray(type)) {
      const dict = arrayToDict(type);
      parsers[prop] = str => {
        if (!dict[str]) throw new ApiError(400, 'Invalid request');
        return str;
      }
    } else {
      parsers[prop] = parsersByType[type as string];
    }
  }
  return req => {
    const reqQuery = {...req.query, ...req.params};
    const query: Record<string, any> = {};
    for (const prop of props) {
      const val = reqQuery[prop];
      if (typeof val === 'undefined') continue;
      if (typeof val !== 'string') throw new ApiError(400, 'Invalid request');
      query[prop] = parsers[prop](val);
    }
    return query as QueryType<Q>;
  }
}

export const isAuthenticated: ExpressHandler = function isAuthenticated(req, res, next): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.statusCode = 401;
    res.send('Authentication required for this resource');
  }
}

export function isAuthorisedFactory(accessControlFn: AccessControl): ExpressHandler {
  return async (req, res, next) => {
    if (await accessControlFn(req.user, req.query, req)) {
      next();
    } else {
      res.statusCode = 403;
      res.send('Resource forbidden');
    }
  }
}


export function queryParserFactory(query: QueryParams): ExpressHandler {
  const queryParser = createQueryParser(query);
  return (req, res, next) => {
    try {
      req.query = queryParser(req);
      next();
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