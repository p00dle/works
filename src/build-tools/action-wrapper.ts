export class UserError extends Error {
  constructor(...args: any[]) {
    super(...args);
  }
}

export function actionWrapper(fn: (...args: any[]) => Promise<string | undefined>): (...args: any[]) => any {
  return async (...args) => {
    try {
      console.info(await fn(...args) || 'Success');
      process.exit(0);
    } catch (err) {
      // console.error(err instanceof UserError ? err.message : err);
      console.error(err);
      // @ts-ignore
      console.error(err.trace);
      // @ts-ignore
      console.error(err.stack);
      process.exit(1);
    }
  }
}