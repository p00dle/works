import { rbacFactory } from 'works';
import { User } from '~/components/user/types';

/** @internal */
export const roleBased = rbacFactory<User>();

/** @internal */
export const adminOnly = roleBased('admin');