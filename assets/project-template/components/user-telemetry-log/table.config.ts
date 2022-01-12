import { Table } from 'works';

export const table: Table =  {
  lock: true,
  name: 'userTelemetryLogs',
  columns: [
    { name: 'uuid', type: 'uuid', unique: true },
    { name: 'type', type: 'string', nullable: false },
    { name: 'username', type: 'text', nullable: false },
    { name: 'path', type: 'string', nullable: false },
    { name: 'timestamp', type: 'timestamp', nullable: false },
    { name: 'interval', type: 'integer', nullable: true },
    { name: 'details', type: 'jsonb', nullable: true }
  ],
};
