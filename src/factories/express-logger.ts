import type { RequestHandler } from 'express';
import { Logger } from '../types/logger';

export function expressLoggerFactory(logger: Logger, namespace: string): RequestHandler {
  const log = logger.namespace(namespace);
  return (req, _res, next) => {
    log.debug(`${String(req.method).padEnd(8)}${String(req.user ? '[AUTH]' : '[GUEST]').padEnd(8)} ${req.path} `);
    next();
  }
}