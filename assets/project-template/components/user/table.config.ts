import { Table } from 'works';

/** @internal */
export const userRoles = [
  'admin',
  'non-admin',
] as const;

export const DEFAULT_USER_ROLE: UserRole = 'non-admin';

export const table: Table =  {
  lock: true,
  name: 'users',
  columns: [
    { name: 'uuid', type: 'uuid', unique: true, primary: true },
    { name: 'username', type: 'text', unique: true, indexed: true },
    { name: 'passwordHash', type: 'text', nullable: false },
    { name: 'role', type: 'enum', enumValues: userRoles, nullable: false, defaultTo: DEFAULT_USER_ROLE },
    { name: 'email', type: 'text', unique: true, indexed: true },
    { name: 'firstNames', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'lastLogin', type: 'datetime'},
    { name: 'passwordLastChanged', type: 'datetime'},
    { name: 'passwordResetToken', type: 'text'},
    { name: 'passwordResetTokenExpiry', type: 'datetime'},
    { name: 'permissions', type: 'jsonb', defaultTo: {} },
  ],
};

/** @internal */
export type UserRole = (typeof userRoles)[number];