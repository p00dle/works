import { envVar } from '../factories/env-var';



export const env = {
  isProduction: envVar({ type: 'boolean', defaultTo: false, var: 'NODE_ENV', parse: str => /prod/i.test(str) }),
  serverPort: envVar({ var: 'PORT', type: 'number', defaultTo: 8080}),
  secret: envVar({ var: 'SECRET', type: 'string', required: true}),
  usernames: envVar({var: 'USERNAMES', type: 'string[]'}),
};