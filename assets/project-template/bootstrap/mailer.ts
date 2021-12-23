import { mailerFactory } from 'works';

import { emailFrom, isProduction } from '~/bootstrap/global-env-vars';

import { newUserCredentials } from '~/mailer-templates/new-user-credentials'
import { passwordResetToken } from '~/mailer-templates/password-reset-token';

const templates = {
  newUserCredentials,
  passwordResetToken,
}
export const sendEmail = mailerFactory({
  sender: () => void 0,
  templates,
  from: emailFrom,
  isProduction,
})