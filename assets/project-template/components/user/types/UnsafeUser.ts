// @works-lock-file:false

import type { User } from './User';

/** @internal */
export interface UnsafeUser extends User {
  uuid: string;
  passwordHash: string;
  passwordLastChanged: number;
  passwordResetToken: string;
  passwordResetTokenExpiry: number;
}