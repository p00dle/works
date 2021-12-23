export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

export interface LogMessage<T = string | Error> {
  namespace: string;
  timestamp: number;
  logLevel: LogLevel;
  payload: T;

}

export type LogConsumer<T = string | Error> = (message: LogMessage<T>) => void;


export interface LogFactoryParams<T = string | Error> {
  consumer: (message: LogMessage<T>) => void;
  logLevel?: LogLevel;
  namespace?: string;
  logOnly?: string | null;
}

export interface Logger<T = string | Error> {
  debug: (payload: T) => void;
  info: (payload: T) => void;
  warn: (payload: T) => void;
  error: (payload: T) => void;
  namespace: (namespace: string) => Logger<T>;
  setLogLevel: (level: LogLevel) => Logger<T>;
  start: () => void;
  end: () => void;
  shouldLog: (level: LogLevel) => boolean;
}

export type LogFactory<T = string | Error> = (params: LogFactoryParams<T>) => Logger<T>;