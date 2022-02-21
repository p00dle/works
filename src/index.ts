import type { RequestHandler } from 'express';

export type Middleware = RequestHandler;
export type { GetEndpoints, HttpGetApiParser, GetEndpoint, PostEndpoints, HttpPostApiParser, PostEndpoint } from './types/endpoint';
export type { CsvColumn, CsvApiParser, CsvEndpoints } from './types/csv-endpoint';
export type { WsApiParser, WsChannels, WsChannel } from './types/ws-channel';
export type { AccessControl } from './types/_common';
export type { Table } from './types/table';
export type { EmailEntity, MailerTemplate } from './types/mailer';
export type { PassportParams, GeolocationLookup } from './types/passport-params';
export type { Logger, LogLevel } from './types/logger';

export { DateX, FiscalDateX } from './lib/datex';
export { endpoint } from './factories/endpoint';
export { csvEndpoint } from './factories/csv-endpoint';
export { envVar } from './factories/env-var';
export { eventsFactory } from './factories/events';
export { keyValueStoreFactory, inMemoryKeyValueStore } from './factories/key-value-store';
export { cache } from './factories/cache';
export { wsChannel } from './factories/ws-channel';
export { bootstrapApiRouter } from './factories/api-router';
export { bootstrapCsvRouter } from './factories/csv-router';
export { getRootDir } from './lib/get-rootdir';
export * as utils from './lib/utils';
export { rbacFactory } from './factories/rbac';
export { mailerFactory } from './factories/mailer'
export { readWorksConfigFile } from './lib/read-works-config';
export { wsServerFactory } from './factories/ws-server';
export { wsPubSubFactory } from './factories/ws-pubsub';
export { ApiError } from './lib/express-middlewares';
export { singleStrategyPassportFactory } from './factories/passport';
export { singleInstanceEvents } from './defaults/events';
export { pgEventsFactory } from './defaults/pg-events';
export { consoleLoggerConsumerFactory } from './defaults/console-log-consumer';
export { logFactory } from './factories/logger';

// add logging everywhere