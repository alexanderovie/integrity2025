import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, MessageBox, MutedText, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { ContactTeamNotificationEmailProps } from "./types";

export const PreviewProps = {
  name: "Maria Rivera",
  email: "maria@example.com",
  phone: "+14075551212",
  service: "Commercial Cleaning",
  message: "We need recurring office cleaning twice per week.",
} satisfies ContactTeamNotificationEmailProps;

export default function ContactTeamNotificationEmail({
  name,
  email,
  phone,
  service,
  message,
  footerAddress,
}: ContactTeamNotificationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview={`New contact form submission from ${name}`}
      title="New Contact Form Submission"
      eyebrow="Lead notification"
      footerAddress={footerAddress}
    >
      <Paragraph>A new visitor submitted the contact form.</Paragraph>
      <DetailCard title="Contact details" tone="success">
        <KeyValueRow label="Name" value={name} />
        <KeyValueRow label="Email" value={email} />
        {phone ? <KeyValueRow label="Phone" value={phone} /> : null}
        {service ? <KeyValueRow label="Service" value={service} /> : null}
      </DetailCard>
      <MutedText>Message</MutedText>
      <MessageBox>{message}</MessageBox>
      <MutedText>Submitted through the Integrity Clean Solutions website.</MutedText>
    </EmailLayout>
  );
}

