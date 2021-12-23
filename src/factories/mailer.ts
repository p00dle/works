import type { Email, EmailEntity, EmailRecipients, EmailSenderFactory, EmailTransformed } from '../types/mailer';

import { UserError } from '../build-tools/action-wrapper';
import { noOpLogger } from '../defaults/noop-logger';
import { isLogger } from './logger';

function isArrayOfStrings(arr: any[]): arr is string[] {
  return arr.every(t => typeof t === 'string');
}

function isEmailEntity(t : any): t is EmailEntity {
  return t && typeof t === 'object' && typeof t['name'] === 'string' && typeof t['email'] === 'string';
}

function convertToEmailEntity(recipientsOriginal: EmailRecipients): EmailEntity[] | null {
  let recipients: EmailRecipients = recipientsOriginal;
  if (!recipients) return null;
  if (typeof recipients === 'string') {
    if (recipients.length === 0) return null;
    if (/\{/.test(recipients)) {
      recipients = JSON.parse(recipients);
    } else {
      const match = recipients.match(/[;,\t]/);
      if (!match) return [{name: '', email: recipients}];
      const emails = recipients.split(match[0]);
      return emails.map(email => ({name: '', email}));
    }
  }
  if (Array.isArray(recipients)) {
    if (recipients.length === 0) return null;
    if (isArrayOfStrings(recipients)) {
      return recipients.map(email => ({name: '', email}))
    }
    if (recipients.every(isEmailEntity)) return recipients;
  }
  if (isEmailEntity(recipients)) return [recipients];
  return null;
}

function mailToString(templateId: string, email: EmailTransformed): string {
  return `Email to be sent: 
TEMPLATE ID: ${templateId}}
FROM: ${email.from.name} ${email.from.email}
TO:1
${email.to.map(entity => `  ${entity.name} ${entity.email}`).join('\n')}
REPLY TO

SUBJECT: ${email.subject}
TEXT:
${email.textContent}
`;
}

function transformEmail(email: Email, defaultFrom?: EmailEntity | null): EmailTransformed {
  const from = email.from || defaultFrom;
  if (!from) throw new UserError('Email template did not provide from property and from global from was not provided');
  const to = convertToEmailEntity(email.to);
  if (!to) throw new UserError('Email template did not create a correct to property');
  const replyTo = convertToEmailEntity(email.replyTo) || convertToEmailEntity(from);
  if (!replyTo) throw new UserError('Email template cannot create correct replyTo property');
  const { subject, textContent } = email;
  return { from, to, replyTo, subject, textContent };
}

export const mailerFactory: EmailSenderFactory = function mailerFactory({sender, templates, from, isProduction, logger}) {
  const log = isLogger(logger) ? logger.namespace('Works.Mailer') : noOpLogger;
  return async (templateId, params) => {
    const templateFn = templates[templateId];
    const email = templateFn(params);
    const transformedEmail = transformEmail(email, from);
    if (isProduction) {
      return await sender(transformedEmail);
    } else {
      log.debug(mailToString(templateId as string, transformedEmail));
    }
  }
}
