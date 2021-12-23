import { MailerTemplate } from 'works';

interface MailerParams {
  email: string;
  username: string;
  fullName: string;
  password: string;
}

export const newUserCredentials: MailerTemplate<MailerParams> = ({ email, fullName, password, username }) => ({
  to: {name: fullName, email },
  subject: 'Credentials',
  textContent: `Hi ${fullName}

We have created an account for you.

Your credentials are as below.

Username: ${username}
Password: ${password}

For security purposes please reset your password as soon as you login.

Please let us know if you have any issues with logging in.

Regards,
Admin Team
`
});

