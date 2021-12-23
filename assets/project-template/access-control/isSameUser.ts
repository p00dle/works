import type { AccessControl } from 'works';

/** @internal */
export const isSameUser: AccessControl = async function isSameUser(user: {username: string}, query: { username: string}) {
  return user.username === query.username;
}