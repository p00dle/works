import { Logger } from '../types/logger';

export const noOpLogger: Logger = {
  shouldLog: () => false,
  start: () => null,
  end: () => null,
  debug: () => null,
  info: () => null,
  warn: () => null,
  error: () => null,
  setLogLevel: () => noOpLogger,
  namespace: () => noOpLogger,
}
