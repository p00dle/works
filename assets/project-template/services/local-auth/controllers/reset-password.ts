import { utils } from 'works';
import { unsafeReadUserByUsername, updateUserPassword } from '~/components/user/queries';
import * as owasp from 'owasp-password-strength-test';

type ResetPasswordArgs = {
  username: string;
  password: string;
  password2: string;
  oldPassword?: string;
  token?: string;
}


export async function resetPasswordAuthenticated(_query: any, {username, oldPassword, password, password2}: ResetPasswordArgs): Promise<string> {
  if (password !== password2) return 'Passwords do not match';
  const user = await unsafeReadUserByUsername({username});
  if (!user) return 'Unknown server error';
  if (!oldPassword) return 'Old password not supplied';
  if (!utils.verifyHash(oldPassword, user.passwordHash)) return 'Invalid current password';
  const testResult = owasp.test(password);
  if (!testResult.strong) return testResult.errors.join('\n');
  const passwordHash = utils.createHash(password);
  try {
    await updateUserPassword({username}, {passwordHash});
    return 'OK';
  } catch (error) {
    return 'Internal server error; please contact the administrator';
  }
}


export async function resetPasswordUnauthenticated({username, password, password2, token}: ResetPasswordArgs): Promise<string> {
  if (password !== password2) return 'Passwords do not match';
  const user = await unsafeReadUserByUsername({username});
  if (!user) return 'Unknown server error';
  if (+user.passwordResetTokenExpiry < Date.now()) return 'Password reset token expired';
  if (token !== user.passwordResetToken) return 'Password reset token not matching';
  const testResult = owasp.test(password);
  if (!testResult.strong) return testResult.errors.join('\n');
  const passwordHash = utils.createHash(password);
  try {
    await updateUserPassword({username}, {passwordHash});
    return 'OK';
  } catch (err) {
    return 'Internal server error; please contact the administrator';
  }
}
