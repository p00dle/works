import { consoleLoggerConsumerFactory } from '../defaults/console-log-consumer';
import { logFactory } from '../factories/logger';
import { task } from '../factories/task';

const log = logFactory({consumer: consoleLoggerConsumerFactory()}).namespace('rebuild-cache')
export const rebuildCache = task({__filename, log}, async () => {
  log.info('rebuilding cache');
  // do stuff
  log.info('cache should be rebuilt now');

});
