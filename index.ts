import type { RequestHandler } from 'express';

export type Middleware = RequestHandler;
export type { Endpoints, HttpApiParser } from './src/types/endpoint';
export type { CsvColumn, CsvApiParser, CsvEndpoints } from './src/types/csv-endpoint';
export type { WsApiParser, WsChannels } from './src/types/ws-channel';
export type { AccessControl } from './src/types/_common';
export type { Table } from './src/types/table';
export type { EmailEntity, MailerTemplate } from './src/types/mailer';
export type { PassportParams } from './src/types/passport-params';
export type { Logger } from './src/types/logger';

export { DateX, FiscalDateX } from './src/lib/datex';
export { endpoint } from './src/factories/endpoint';
export { csvEndpoint } from './src/factories/csv-endpoint';
export { envVar } from './src/factories/env-var';
export { eventsFactory } from './src/factories/events';
export { keyValueStoreFactory, inMemoryKeyValueStore } from './src/factories/key-value-store';
export { cache } from './src/factories/cache';
export { wsChannel } from './src/factories/ws-channel';
export { bootstrapApiRouter } from './src/factories/api-router';
export { bootstrapCsvRouter } from './src/factories/csv-router';
export { getRootDir } from './src/lib/get-rootdir';
export * as utils from './src/lib/utils';
export { rbacFactory } from './src/factories/rbac';
export { mailerFactory } from './src/factories/mailer'
export { readWorksConfigFile } from './src/lib/read-works-config';
export { wsServerFactory } from './src/factories/ws-server';
export { wsPubSubFactory } from './src/factories/ws-pubsub';
export { ApiError } from './src/lib/express-middlewares';
export { singleStrategyPassportFactory } from './src/factories/passport';
export { singleInstanceEvents } from './src/defaults/events';
export { pgEventsFactory } from './src/defaults/pg-events';
export { consoleLoggerConsumerFactory } from './src/defaults/console-log-consumer';
export { logFactory } from './src/factories/logger';

// add logging everywhere