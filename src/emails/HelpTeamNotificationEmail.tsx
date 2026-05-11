import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, MessageBox, MutedText, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { HelpTeamNotificationEmailProps } from "./types";

export const PreviewProps = {
  name: "James Carter",
  email: "james@example.com",
  phone: "+14075559898",
  notes: "Please call me about a one-time deep clean this week.",
} satisfies HelpTeamNotificationEmailProps;

export default function HelpTeamNotificationEmail({
  name,
  email,
  phone,
  notes,
  footerAddress,
}: HelpTeamNotificationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview={`Help request from ${name}`}
      title="New Help Request"
      eyebrow="Customer request"
      footerAddress={footerAddress}
    >
      <Paragraph>A visitor requested help from the website.</Paragraph>
      <DetailCard title="Request details" tone="info">
        <KeyValueRow label="Name" value={name} />
        <KeyValueRow label="Email" value={email} />
        <KeyValueRow label="Phone" value={phone} />
      </DetailCard>
      {notes ? (
        <>
          <MutedText>Additional details</MutedText>
          <MessageBox>{notes}</MessageBox>
        </>
      ) : null}
      <MutedText>Please contact the customer at the provided phone number.</MutedText>
    </EmailLayout>
  );
}
