import * as colors from 'colors/safe';
import { LogConsumer, LogLevel } from '../types/logger';

const logColors: Record<LogLevel, keyof typeof colors> = {
  debug: 'gray', info: 'green', warn: 'yellow', error: 'red', silent: 'black',
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
}

export function consoleLoggerConsumerFactory({useColors = true, useTimestamp = true, useLogLevel = true, useUTC = false}: Params = {}): LogConsumer {
  const getTimestamp = useUTC ? getUtcTimestampText : getTimestampText;
  if (useColors) {
    if (useTimestamp) {
      if (useLogLevel) {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (colors[logColors[logLevel]] || stringId) as (str: string) => string;
          const timestampText = colors.white(getTimestamp(timestamp));
          const logLevelText = colors.blue(`[${logLevel.padEnd(5, ' ')}]`);
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${timestampText} ${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, timestamp, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (colors[logColors[logLevel]] || stringId) as (str: string) => string;
          const timestampText = colors.white(getTimestamp(timestamp));
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
          const colorFn = (colors[logColors[logLevel]] || stringId) as (str: string) => string;
          const logLevelText = colors.blue(`[${logLevel.padEnd(5, ' ')}]`);
          const namespaceText = colorFn(`[${namespace}]`);
          const payloadText = colorFn(stringifyPayload(payload));
          const text = `${logLevelText} ${namespaceText} ${payloadText}`;
          console[logLevel](text);
        };
      } else {
        return ({namespace, logLevel, payload}) => {
          if (logLevel === 'silent') return;
          const colorFn = (colors[logColors[logLevel]] || stringId) as (str: string) => string;
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
