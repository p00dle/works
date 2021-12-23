import { Logger } from './logger';

export interface EmailEntity {
  name: string;
  email: string;
}

export type EmailRecipients =
  | string
  | string[]
  | EmailEntity
  | EmailEntity[]
  | undefined
;


export interface Email {
  from?: EmailEntity;
  to: EmailRecipients;
  textContent: string;
  subject: string;
  replyTo?: EmailRecipients;
}

export interface EmailTransformed {
  from: EmailEntity;
  to: EmailEntity[];
  textContent: string;
  subject: string;
  replyTo: EmailEntity[];
}

export type EmailBaseSender = (email: EmailTransformed) => any;

export type MailerTemplate<T> = (params: T) => Email;

export type MailerTemplates = Record<string, MailerTemplate<any>>;

export type Mailer<T extends MailerTemplates, K extends keyof T = keyof T> = (templateId: K, params: Parameters<T[K]>[0]) => any;

interface EmailSenderFactoryParams<T> {
  sender: EmailBaseSender;
  templates: Record<keyof T, MailerTemplate<any>>;
  from?: EmailEntity | null;
  isProduction: boolean;
  logger?: Logger;
}

export type EmailSenderFactory = <T extends MailerTemplates>(params: EmailSenderFactoryParams<T>) => Mailer<T>;
