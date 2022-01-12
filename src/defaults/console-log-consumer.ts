import * as chalk from 'chalk';
import { LogConsumer, LogLevel } from '../types/logger';

type Color = typeof chalk.Color;
type ColorType = LogLevel | 'timestamp' | 'logLevel'

const DEFAULT_COLORS: Record<ColorType, Color> = {
  debug: 'gray', 
  info: 'green', 
  warn: 'yellow', 
  error: 'red', 
  silent: 'black',
  timestamp: 'whiteBright',
  logLevel: 'blueBright',
};

function getUtcTimestampText(n: number): string {
  const date = new Date(n);
  return `${date.getUTCFullYear()}-${
    String(date.getUTCMonth() + 1).padStart(2, '0')}-${
    String(date.getUTCDate()).padStart(2, '0')} ${
    String(date.getUTCHours()).padStart(2, '0')}:${
    String(date.getUTCMinutes()).padStart(2, '0')}:${
    String(date.getUTCSeconds()).padStart(2, '0')}.${
    String(date.getUTCMilliseconds()).padStart(3, '0')}`;
}

function getTimestampText(n: number): string {
  const date = new Date(n);
  return `${date.getFullYear()}-${
    String(date.getMonth() + 1).padStart(2, '0')}-${
    String(date.getDate()).padStart(2, '0')} ${
    String(date.getHours()).padStart(2, '0')}:${
    String(date.getMinutes()).padStart(2, '0')}:${
    String(date.getSeconds()).padStart(2, '0')}.${
    String(date.getMilliseconds()).padStart(3, '0')}`;
}


function stringId(str: string): string {
  return str;
}

function stringifyPayload(payload: string | Error): string {
  return payload instanceof Error ? payload.stack || payload.message || String(payload) : payload;
}

interface Params {
  useColors?: boolean;
  useTimestamp?: boolean;
  useLogLevel?: boolean;
  useUTC?: boolean;
  colors?: Record<ColorType, Color>;
}

export function consoleLoggerConsumerFactory({useColors = true, useTimestamp = true, useLogLevel = true, useUTC = false, colors = DEFAULT_COLORS}: Params = {}): LogConsumer {
  const getTimestamp = useUTC ? getUtcTimestampText : getTimestampText;
  if (useColors) {
    if (useTimestamp) {
      if (useLogLevel) {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (chalk[colors[logLevel]] || stringId) as (str: string) => string;
          const timestampText = chalk[colors.timestamp](getTimestamp(timestamp));
          const logLevelText = chalk[colors.logLevel](`[${logLevel.padEnd(5, ' ')}]`);
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${timestampText} ${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (chalk[colors[logLevel]] || stringId) as (str: string) => string;
          const timestampText = chalk[colors.timestamp](getTimestamp(timestamp));
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${timestampText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      }
    } else {
      if (useLogLevel) {
        return ({namespace, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (chalk[colors[logLevel]] || stringId) as (str: string) => string;
          const logLevelText = chalk[colors.logLevel](`[${logLevel.padEnd(5, ' ')}]`);
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (chalk[colors[logLevel]] || stringId) as (str: string) => string;
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      }
    }
  } else {
    if (useTimestamp) {
      if (useLogLevel) {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const timestampText = getTimestamp(timestamp);
          const logLevelText = `[${logLevel.padEnd(5, ' ')}]`;
          const namespaceText = `[${namespace}]`;
          const payloadText = stringifyPayload(payload);
          const text = `${timestampText} ${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const timestampText = getTimestamp(timestamp);
          const namespaceText = `[${namespace}]`;
          const payloadText = stringifyPayload(payload);
          const text = `${timestampText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      }
    } else {
      if (useLogLevel) {
        return ({namespace, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const logLevelText = `[${logLevel.padEnd(5, ' ')}]`;
          const namespaceText = `[${namespace}]`;
          const payloadText = stringifyPayload(payload);
          const text = `${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const namespaceText = `[${namespace}]`;
          const payloadText = stringifyPayload(payload);
          const text = `${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      }
    }
  }
}
