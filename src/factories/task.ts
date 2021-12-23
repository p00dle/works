import { noOpLogger } from '../defaults/noop-logger';
import { Logger } from '../types/logger';


function removeExtension(str: string): string {
  return str.replace(/\.[a-zA-Z]+$/, '');
}

function isFileEntryPoint(moduleFilename: string): boolean {
  return removeExtension(moduleFilename) === removeExtension(__filename);
}

interface TaskParams {
  __filename: string;
  log?: Logger;
  repeat?: number;
}

export function task<A, R>({__filename: moduleFileName, log = noOpLogger, repeat = 1}: TaskParams, fn: (args: A) => R | Promise<R>): (args: A) => Promise<R> {
  let wrapper = async (args: A): Promise<R> => {
    log.start();
    try {
      const result = await fn(args);
      log.end();
      return result;
    } catch(err) {
      log.error(err instanceof Error ? err : typeof err === 'string' ? err : '' + err);
      log.end();
      throw err;
    }
  }
  const isMain = isFileEntryPoint(moduleFileName);
  if (isMain) {
    log.debug(`running task ${typeof fn.name === 'undefined' ? '' : `${fn.name} `}as main process`)
    if (repeat === 0) {
      log.debug(`task will be repeated indefinitely until successful`);
      wrapper = async (args: A) => {
        while (true) {
          try {
            return await fn(args);
          } catch {
            log.warn('repeating task');
          }
        }
      }
    } else if (repeat > 1) {
      let repeatsLeft = repeat;
      log.debug(`task will be repeated ${repeat} times if unsuccessful`);
      wrapper = async (args: A) => {
        while (repeatsLeft > 0) {
          try {
            return await fn(args);
          } catch {
            repeatsLeft--;
            log.warn(`repeating task; ${repeatsLeft} retries left`);
          }
        }
        log.error(`task did not complete successfully`);
        throw Error();
      }
    }
    wrapper(null as unknown as A).then(
      () => process.exit(0),
      () => process.exit(1)
    );
  } 
  return wrapper;
}