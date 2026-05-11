import type { ReactNode } from "react";
import { render, toPlainText } from "react-email";
import ContactTeamNotificationEmail, {
  PreviewProps as ContactTeamNotificationPreviewProps,
} from "../src/emails/ContactTeamNotificationEmail";
import HelpTeamNotificationEmail, {
  PreviewProps as HelpTeamNotificationPreviewProps,
} from "../src/emails/HelpTeamNotificationEmail";
import JobApplicationConfirmationEmail, {
  PreviewProps as JobApplicationConfirmationPreviewProps,
} from "../src/emails/JobApplicationConfirmationEmail";
import JobApplicationTeamNotificationEmail, {
  PreviewProps as JobApplicationTeamNotificationPreviewProps,
} from "../src/emails/JobApplicationTeamNotificationEmail";
import NewsletterTeamNotificationEmail, {
  PreviewProps as NewsletterTeamNotificationPreviewProps,
} from "../src/emails/NewsletterTeamNotificationEmail";
import NewsletterWelcomeEmail, {
  PreviewProps as NewsletterWelcomePreviewProps,
} from "../src/emails/NewsletterWelcomeEmail";
import PaymentConfirmationEmail, {
  PreviewProps as PaymentConfirmationPreviewProps,
} from "../src/emails/PaymentConfirmationEmail";
import PaymentTeamNotificationEmail, {
  PreviewProps as PaymentTeamNotificationPreviewProps,
} from "../src/emails/PaymentTeamNotificationEmail";

export type EmailFixtureName =
  | "contact.team_notification"
  | "help.team_notification"
  | "job_application.confirmation"
  | "job_application.team_notification"
  | "newsletter.team_notification"
  | "newsletter.welcome"
  | "payment.confirmation"
  | "payment.team_notification";

type EmailFixture = {
  subject: string;
  component: ReactNode;
};

export const emailFixtureNames: EmailFixtureName[] = [
  "contact.team_notification",
  "help.team_notification",
  "job_application.confirmation",
  "job_application.team_notification",
  "newsletter.team_notification",
  "newsletter.welcome",
  "payment.confirmation",
  "payment.team_notification",
];

export function getEmailFixture(name: EmailFixtureName): EmailFixture {
  switch (name) {
    case "contact.team_notification":
      return {
        subject: `New Contact Form Submission from ${ContactTeamNotificationPreviewProps.name}`,
        component: <ContactTeamNotificationEmail {...ContactTeamNotificationPreviewProps} />,
      };
    case "help.team_notification":
      return {
        subject: `Help Request from ${HelpTeamNotificationPreviewProps.name} - Integrity Clean Solutions`,
        component: <HelpTeamNotificationEmail {...HelpTeamNotificationPreviewProps} />,
      };
    case "job_application.confirmation":
      return {
        subject: "We received your application - Integrity Clean Solutions",
        component: <JobApplicationConfirmationEmail {...JobApplicationConfirmationPreviewProps} />,
      };
    case "job_application.team_notification":
      return {
        subject: `New Job Application from ${JobApplicationTeamNotificationPreviewProps.name}`,
        component: <JobApplicationTeamNotificationEmail {...JobApplicationTeamNotificationPreviewProps} />,
      };
    case "newsletter.team_notification":
      return {
        subject: "New newsletter subscriber",
        component: <NewsletterTeamNotificationEmail {...NewsletterTeamNotificationPreviewProps} />,
      };
    case "newsletter.welcome":
      return {
        subject: "Welcome to Integrity Clean Solutions",
        component: <NewsletterWelcomeEmail {...NewsletterWelcomePreviewProps} />,
      };
    case "payment.confirmation":
      return {
        subject: "Payment Confirmed - Integrity Clean Solutions",
        component: <PaymentConfirmationEmail {...PaymentConfirmationPreviewProps} />,
      };
    case "payment.team_notification":
      return {
        subject: "New Payment Received - Integrity Clean Solutions",
        component: <PaymentTeamNotificationEmail {...PaymentTeamNotificationPreviewProps} />,
      };
  }
}

export function isEmailFixtureName(value: string): value is EmailFixtureName {
  return emailFixtureNames.includes(value as EmailFixtureName);
}

export async function renderEmailFixture(name: EmailFixtureName): Promise<{
  subject: string;
  html: string;
  text: string;
}> {
  const fixture = getEmailFixture(name);
  const html = await render(fixture.component);
  return {
    subject: fixture.subject,
    html,
    text: toPlainText(html),
  };
}

