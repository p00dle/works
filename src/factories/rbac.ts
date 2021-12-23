import { AccessControl } from '../..';
import { arrayToDict } from '../lib/utils';

export type AclOptions<T extends string[] | readonly string[]> =
  | T[number] | '*'
  | (T[number] | '*')[]
  | Record<T[number] | '*', boolean | AccessControl>
;

interface User {
  role: string;
}

async function allow() {
  return true;
}

async function forbid() {
  return false;
}

function makeAccessControl(access: boolean | AccessControl): AccessControl {
  if (typeof access === 'function') return access;
  else if (typeof access === 'boolean') return access ? allow : forbid;
  throw Error('Invalid access control');
}

export function rbacFactory<T extends string[] | readonly string[]>(userRoles: T): (options: AclOptions<T>) => AccessControl<User, any> {
  return options => {
    if (typeof options === 'string') {
      if (options === '*') return allow;
      else return async user => user.role === options;
    } else if (Array.isArray(options)) {
      const map = arrayToDict(options);
      if (map['*']) return allow;
      else return async user => map[user.role] || false;
    } else if (typeof options === 'object' && Object.keys(options).length > 0) {
      const hasWildCard = !!options['*'];
      const defaultAccess = hasWildCard ? makeAccessControl(options['*']) : forbid;
      const accessByRole: Record<string, AccessControl> = {};
      for (const [role, access] of Object.entries(options)) {
        accessByRole[role] = makeAccessControl(access);
      }
      return async (user: User, query, req) => {
        const accessFn = accessByRole[user.role] || defaultAccess;
        return await accessFn(user, query, req);
      }
    }
    throw Error('Invalid options provided');
  }
}