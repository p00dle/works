// @works-lock-file:false

import { dbPool } from '~/bootstrap/db-pool';

import { createManyUsersFactory } from './queries/createManyUsers';
import { createUserFactory } from './queries/createUser';
import { deleteUserFactory } from './queries/deleteUser';
import { isManagerOfFactory } from './queries/isManagerOf';
import { readAllUsersFactory } from './queries/readAllUsers';
import { readUserByUsernameFactory } from './queries/readUserByUsername';
import { readUserByEmailFactory } from './queries/readUserByEmail';
import { streamUsersFactory } from './queries/streamUsers';
import { unsafeReadUserByUsernameFactory } from './queries/unsafeReadUserByUsername';
import { updateUserFactory } from './queries/updateUser';
import { updateUserLastLoginFactory } from './queries/updateUserLastLogin';
import { updateUserPasswordFactory } from './queries/updateUserPassword';
import { updateUserTokenFactory } from './queries/updateUserToken';

export const isManagerOf = isManagerOfFactory(dbPool);
export const readAllUsers = readAllUsersFactory(dbPool);
export const readUserByUsername = readUserByUsernameFactory(dbPool);
export const streamUsers = streamUsersFactory(dbPool);
export const unsafeReadUserByUsername = unsafeReadUserByUsernameFactory(dbPool);
export const readUserByEmail = readUserByEmailFactory(dbPool);

export const createManyUsers = createManyUsersFactory(dbPool);
export const createUser = createUserFactory(dbPool);
export const deleteUser = deleteUserFactory(dbPool);
export const updateUser = updateUserFactory(dbPool);
export const updateUserLastLogin = updateUserLastLoginFactory(dbPool);
export const updateUserPassword = updateUserPasswordFactory(dbPool);
export const updateUserToken = updateUserTokenFactory(dbPool);