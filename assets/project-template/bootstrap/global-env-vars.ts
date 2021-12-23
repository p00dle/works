import type { EmailEntity, LogLevel } from 'works';

import { envVar, utils } from 'works';

export const isProduction = envVar({var: 'NODE_ENV', type: 'boolean', defaultTo: false, parse: str => str.toLowerCase().includes('prod')});
export const bypassAuthorisation = envVar({var: 'BYPASS_AUTHORISATION', type: 'boolean', defaultTo: false});
export const bypassAuthentication = envVar({var: 'BYPASS_AUTHENTICATION', type: 'boolean', defaultTo: false});
export const port = envVar({var: 'PORT', type: 'number', defaultTo: 8080});
export const emailFrom = envVar({var: 'MAIL_FROM', type: 'infer', parse: str => str ? utils.toType<EmailEntity>(JSON.parse(str)) : null});
export const databaseUrl = envVar({ type: 'string', var: 'DATABASE_URL', required: true });
export const logLevel = envVar({ type: 'infer', var: 'LOG_LEVEL', parse: str => utils.toType<LogLevel>(str)});
export const logOnly = envVar({type: 'string', var: 'LOG_ONLY' });
export const sessionSecret = isProduction 
  ? envVar({var: 'SESSION_SECRET', type: 'string', required: true})
  : envVar({var: 'SESSION_SECRET', type: 'string', defaultTo: 'SESSION_SECRET'});