import { createPool } from 'slonik';
import { envVar, DateX } from 'works';
import { databaseUrl } from '~/bootstrap/global-env-vars';

const date = new DateX({format: 'YYYY-MM-DD'});
const timestamp = new DateX({format: 'YYYY-MM-DD HH:mm:SS.sss'});

const parseDate = (str: string) => date.parse(str);
const parseTimestamp = (str: string) => timestamp.parse(str);


/*
'boolean': 'bool',
'date': 'date',
'datetime': 'timestamp',
'enum': 'text',
'float': 'real',
'integer': 'int4',
'json': 'json',
'jsonb': 'jsonb',
'serial': 'serial4',
'text': 'text',
'uuid': 'uuid',
*/

// https://github.com/gajus/slonik#api
export const dbPool = createPool(databaseUrl, {
  captureStackTrace: true,
  connectionRetryLimit: 3,
  connectionTimeout: 5000,
  idleInTransactionSessionTimeout: 60000,
  idleTimeout: 5000,
  maximumPoolSize: 10,
  statementTimeout: 60000,
  transactionRetryLimit: 5,
  typeParsers: [
    {name: 'int8', parse: (str: string) => +str },
    {name: 'date', parse: parseDate },
    {name: 'timestamp', parse: parseTimestamp },
  ],
})
