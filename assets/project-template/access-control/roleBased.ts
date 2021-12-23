import { rbacFactory } from 'works';
import { userRoles } from '~/types/user-roles';

/** @internal */
export const roleBased = rbacFactory(userRoles);