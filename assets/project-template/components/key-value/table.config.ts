import type { Table } from 'works';

export const table: Table =  {
  lock: true,
  name: 'works_keyValues',
  columns: [
    { name: 'key', type: 'text', unique: true, primary: true, indexed: true },
    { name: 'value', type: 'jsonb', defaultTo: null },
  ],
};
