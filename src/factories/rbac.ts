import { AccessControl } from '../types/_common';
import { arrayToDict } from '../lib/utils';

export type AccessControlOptions<T extends string> =
  | T | '*'
  | (T | '*')[]
  | Record<T | '*', boolean | AccessControl>
;

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

function isACObject<T extends string>(obj: any): obj is Record<T | '*', boolean | AccessControl> {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0
}

export function rbacFactory<U extends {role: any}>(): (options: AccessControlOptions<U['role']>) => AccessControl<U, any> {
  return options => {
    if (typeof options === 'string') {
      if (options === '*') return allow;
      else return async user => user.role === options;
    } else if (Array.isArray(options)) {
      const map = arrayToDict(options);
      if (map['*']) return allow;
      else return async user => map[user.role] || false;
    } else if (isACObject<U['role']>(options)) {
      const hasWildCard = !!options['*'];
      const defaultAccess = hasWildCard ? makeAccessControl(options['*']) : forbid;
      const accessByRole: Record<string, AccessControl> = {};
      for (const [role, access] of Object.entries(options)) {
        accessByRole[role] = makeAccessControl(access);
      }
      return async (user: U, query, req) => {
        const accessFn = accessByRole[user.role] || defaultAccess;
        return await accessFn(user, query, req);
      }
    }
    throw Error('Invalid options provided');
  }
}