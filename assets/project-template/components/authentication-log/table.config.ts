import type { Table } from 'works';

export const table: Table =  {
  lock: false,
  name: 'authenticationLogs',
  columns: [
    { name: 'uuid', type: 'uuid', defaultTo: 'uuid', primary: true },
    { name: 'timestamp', type: 'datetime', nullable: false },
    { name: 'username', type: 'text', nullable: false },
    { name: 'success', type: 'boolean', nullable: false },
    { name: 'ipAddress', type: 'text', nullable: false },
  ],
};
