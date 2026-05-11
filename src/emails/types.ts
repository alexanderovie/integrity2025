export type EmailTemplateName =
  | "contact.confirmation"
  | "contact.team_notification"
  | "help.team_notification"
  | "job_application.team_notification"
  | "job_application.confirmation"
  | "newsletter.welcome"
  | "newsletter.team_notification"
  | "payment.confirmation"
  | "payment.team_notification";

export const EMAIL_TEMPLATE_VERSION = "2026-05-11.3";

export type BaseEmailProps = {
  footerAddress?: string | null;
};

export type ContactTeamNotificationEmailProps = BaseEmailProps & {
  name: string;
  email: string;
  phone?: string | null;
  service?: string | null;
  message: string;
};

export type ContactConfirmationEmailProps = BaseEmailProps & {
  name: string;
  phone: string;
};

export type HelpTeamNotificationEmailProps = BaseEmailProps & {
  name: string;
  phone: string;
  notes?: string | null;
};

export type JobApplicationTeamNotificationEmailProps = BaseEmailProps & {
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  availability: string;
  startDate?: string | null;
  experienceYears?: string | null;
  workAuthorization: string;
  transportation: string;
  references?: string | null;
  summary: string;
};

export type JobApplicationConfirmationEmailProps = BaseEmailProps & {
  name: string;
  phone: string;
};

export type NewsletterWelcomeEmailProps = BaseEmailProps & {
  unsubscribeUrl?: string | null;
};

export type NewsletterTeamNotificationEmailProps = BaseEmailProps & {
  email: string;
};

export type PaymentConfirmationEmailProps = BaseEmailProps & {
  customerName: string;
  transactionId: string;
  amount: string;
  paidAt: string;
  propertySize?: string | null;
  bedrooms?: string | null;
  bathrooms?: string | null;
  frequency?: string | null;
};

export type PaymentTeamNotificationEmailProps = BaseEmailProps & {
  transactionId: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  serviceId?: string | null;
  paidAt: string;
};
