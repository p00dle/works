import { MailerTemplate } from 'works';

interface MailerParams {
  email: string;
  username: string;
  fullName: string;
  passwordResetToken: string;
}

export const passwordResetToken: MailerTemplate<MailerParams> = ({ email, username, fullName, passwordResetToken }) => ({
  to: {name: fullName, email },
  subject: 'Password reset request',
  textContent: `Hi ${fullName}

A password reset for your account has been requested.

Your username is:
${username}

Your password reset token is:
${passwordResetToken}

To reset password go to password reset page and use the provided token.

Please let us know if you have any issues with resetting your password.

Regards,
Admin Team
`
});

