import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { NewsletterTeamNotificationEmailProps } from "./types";

export const PreviewProps = {
  email: "subscriber@example.com",
} satisfies NewsletterTeamNotificationEmailProps;

export default function NewsletterTeamNotificationEmail({
  email,
  footerAddress,
}: NewsletterTeamNotificationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="New newsletter subscriber."
      title="New Newsletter Subscriber"
      eyebrow="Marketing list"
      footerAddress={footerAddress}
    >
      <Paragraph>A new visitor subscribed to the newsletter.</Paragraph>
      <DetailCard title="Subscriber" tone="info">
        <KeyValueRow label="Email" value={email} />
      </DetailCard>
      <Paragraph>Add or verify the subscriber in your CRM marketing workflow.</Paragraph>
    </EmailLayout>
  );
}

