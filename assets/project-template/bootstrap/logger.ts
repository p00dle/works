import { logFactory } from 'works';
import { logLevel, logOnly } from '~/bootstrap/global-env-vars';

import { consoleLoggerConsumerFactory } from 'works';
const consumer = consoleLoggerConsumerFactory({
  useColors: true, 
  useTimestamp: true, 
  useLogLevel: true, 
  useUTC: true,
})

// import { dbLoggerConsumerFactory } from 'works';
// import { databaseUrl } from '~/bootstrap/global-env-vars';
// const consumer = dbLoggerConsumerFactory(databaseUrl);

export const logger = logFactory({consumer, logLevel, logOnly});
