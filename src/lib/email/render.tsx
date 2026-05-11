import "server-only";

import type { ReactNode } from "react";
import { render, toPlainText } from "react-email";
import {
  EMAIL_TEMPLATE_VERSION,
  type ContactTeamNotificationEmailProps,
  type EmailTemplateName,
  type HelpTeamNotificationEmailProps,
  type JobApplicationConfirmationEmailProps,
  type JobApplicationTeamNotificationEmailProps,
  type NewsletterTeamNotificationEmailProps,
  type NewsletterWelcomeEmailProps,
  type PaymentConfirmationEmailProps,
  type PaymentTeamNotificationEmailProps,
} from "@/emails/types";
import ContactTeamNotificationEmail from "@/emails/ContactTeamNotificationEmail";
import HelpTeamNotificationEmail from "@/emails/HelpTeamNotificationEmail";
import JobApplicationConfirmationEmail from "@/emails/JobApplicationConfirmationEmail";
import JobApplicationTeamNotificationEmail from "@/emails/JobApplicationTeamNotificationEmail";
import NewsletterTeamNotificationEmail from "@/emails/NewsletterTeamNotificationEmail";
import NewsletterWelcomeEmail from "@/emails/NewsletterWelcomeEmail";
import PaymentConfirmationEmail from "@/emails/PaymentConfirmationEmail";
import PaymentTeamNotificationEmail from "@/emails/PaymentTeamNotificationEmail";

export type RenderedEmail = {
  templateName: EmailTemplateName;
  templateVersion: string;
  subject: string;
  html: string;
  text: string;
};

async function renderEmail(input: {
  templateName: EmailTemplateName;
  subject: string;
  component: ReactNode;
}): Promise<RenderedEmail> {
  const html = await render(input.component);
  const text = toPlainText(html);

  return {
    templateName: input.templateName,
    templateVersion: EMAIL_TEMPLATE_VERSION,
    subject: input.subject,
    html,
    text,
  };
}

export async function renderContactTeamNotificationEmail(
  props: ContactTeamNotificationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "contact.team_notification",
    subject: `New Contact Form Submission from ${props.name}`,
    component: <ContactTeamNotificationEmail {...props} />,
  });
}

export async function renderHelpTeamNotificationEmail(
  props: HelpTeamNotificationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "help.team_notification",
    subject: `Help Request from ${props.name} - Integrity Clean Solutions`,
    component: <HelpTeamNotificationEmail {...props} />,
  });
}

export async function renderJobApplicationTeamNotificationEmail(
  props: JobApplicationTeamNotificationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "job_application.team_notification",
    subject: `New Job Application from ${props.name}`,
    component: <JobApplicationTeamNotificationEmail {...props} />,
  });
}

export async function renderJobApplicationConfirmationEmail(
  props: JobApplicationConfirmationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "job_application.confirmation",
    subject: "We received your application - Integrity Clean Solutions",
    component: <JobApplicationConfirmationEmail {...props} />,
  });
}

export async function renderNewsletterWelcomeEmail(
  props: NewsletterWelcomeEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "newsletter.welcome",
    subject: "Welcome to Integrity Clean Solutions",
    component: <NewsletterWelcomeEmail {...props} />,
  });
}

export async function renderNewsletterTeamNotificationEmail(
  props: NewsletterTeamNotificationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "newsletter.team_notification",
    subject: "New newsletter subscriber",
    component: <NewsletterTeamNotificationEmail {...props} />,
  });
}

export async function renderPaymentConfirmationEmail(
  props: PaymentConfirmationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "payment.confirmation",
    subject: "Payment Confirmed - Integrity Clean Solutions",
    component: <PaymentConfirmationEmail {...props} />,
  });
}

export async function renderPaymentTeamNotificationEmail(
  props: PaymentTeamNotificationEmailProps,
): Promise<RenderedEmail> {
  return renderEmail({
    templateName: "payment.team_notification",
    subject: "New Payment Received - Integrity Clean Solutions",
    component: <PaymentTeamNotificationEmail {...props} />,
  });
}

export function getEmailFooterAddress(): string | null {
  return process.env.EMAIL_FOOTER_ADDRESS?.trim() || null;
}

export function getMarketingUnsubscribeUrl(): string | null {
  return process.env.EMAIL_UNSUBSCRIBE_URL?.trim() || null;
}
