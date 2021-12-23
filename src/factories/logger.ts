import { LogFactoryParams, Logger, LogLevel, LogMessage } from '../types/logger';

const logLevelNumberMap: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, silent: 4
};
const regexpCache: Record<string, RegExp> = {};


function formatIntervalMs(num: number): string {
  let n = num;
  const ms = n % 1000;
  n = n - ms;
  const secondsMs = n % 60000;
  const seconds = secondsMs / 1000;
  n = n - secondsMs;
  const minutesMs = n % 3600000;
  const minutes = minutesMs / 60000;
  n = n - minutesMs;
  const hoursMs = n % 86400000;
  const hours = hoursMs / 3600000;
  n = n - hoursMs;
  const days = n / 86400000;
  return `${
    days > 0 ? days + 'd ' : ''
  }${
    hours > 0 ? hours + 'h ' : ''
  }${
    minutes > 0 ? minutes + 'm ' : ''
  }${
    seconds > 0 ? seconds + 's ' : ''
  }${
    ms > 0 ? ms + 'ms' : ''
  }`;
}


export const logFactory = function logFactory<T = string | Error>({consumer, logLevel, namespace = '', logOnly}: LogFactoryParams<T>): Logger<T> {
  let namespaceLogLevelNumber = logLevelNumberMap[logLevel || 'info'];
  const queue: LogMessage<T>[] = [];
  let startTime: number = 0;
  let rMatch: RegExp | null = null;
  if (typeof logOnly === 'string') {
    if (!regexpCache[logOnly]) regexpCache[logOnly] = new RegExp(logOnly, 'i');
    rMatch = regexpCache[logOnly];
  }
  let isFlushing = false;
  async function flushQueue() {
    isFlushing = true;
    while ( queue.length > 0) {
      await consumer(queue.shift() as LogMessage<T>);
    }
    isFlushing = false;
  }
  function send(logLevelNumber: number, logLevel: LogLevel, payload: T) {
    if (logLevelNumber < namespaceLogLevelNumber || (rMatch !== null && rMatch.test(namespace))) return;
    const timestamp = Date.now();
    queue.push({namespace, timestamp, logLevel, payload})
    if (!isFlushing) flushQueue();
  }
  function start(logLevel: LogLevel = 'debug') {
    startTime = Date.now();
    send(logLevelNumberMap[logLevel], logLevel, 'start' as unknown as T);
  }
  function end(logLevel: LogLevel = 'debug') {
    const endTime = Date.now();
    const message = startTime !== 0 ? `end; completed in ${formatIntervalMs(endTime - startTime)}s` : 'end';
    send(logLevelNumberMap[logLevel], logLevel, message as unknown as T);
  }
  function namespaceFn(subNamespace: string) {
    return logFactory({consumer, logLevel, namespace: namespace === '' ? subNamespace : `${namespace}.${subNamespace}`, logOnly});
  }
  function setLogLevel(logLevel: LogLevel) {
    return logFactory({consumer, logLevel, namespace, logOnly});
  }
  function shouldLog(logLevel: LogLevel) {
    return logLevelNumberMap[logLevel] < namespaceLogLevelNumber;
  }
  const debug = (payload: T) => send(0, 'debug', payload);
  const info = (payload: T) => send(0, 'info', payload);
  const warn = (payload: T) => send(0, 'warn', payload);
  const error = (payload: T) => send(0, 'error', payload);
  return { start, end, debug, info, warn, error, namespace: namespaceFn, setLogLevel, shouldLog };
}




const loggerProps: (keyof Logger)[] = [
  'debug',
  'end',
  'error',
  'info',
  'namespace',
  'setLogLevel',
  'shouldLog',
  'start',
  'warn',
]

export function isLogger(logger: any): logger is Logger {
  if (typeof logger !== 'object' || logger === null) return false;
  for (const prop of loggerProps) {
    if (typeof logger[prop] !== 'function') {
      return false;
    }
  }
  return true;
}
