import { ApiError, utils } from 'works';

import { sendEmail } from '~/bootstrap/mailer';
import { readUserByEmail, updateUserToken } from '~/components/user/queries';

export async function requestPasswordReset({email}: {email: string}): Promise<void> {
  const user = await readUserByEmail({email});
  if (!user) throw new ApiError(409, 'Email not found');
  const { username, fullName } = user;
  const passwordResetToken = utils.generateRandomString(24);
  await updateUserToken({username}, {passwordResetToken});
  await sendEmail('passwordResetToken', {fullName, email, passwordResetToken});
}
