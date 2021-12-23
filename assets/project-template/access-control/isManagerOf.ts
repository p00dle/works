import type { AccessControl } from 'works';

import { isManagerOf as isManagerOfQuery } from '~/components/user/queries';

/** @internal */
export const isManagerOf: AccessControl = async function isSameUser(user: {username: string}, query: { username: string}) {
  return await isManagerOfQuery({managerId: user.username, username: query.username});
}