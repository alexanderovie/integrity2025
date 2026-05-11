import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, MessageBox, MutedText, Paragraph, PrimaryButton } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { HelpConfirmationEmailProps } from "./types";

export const PreviewProps = {
  name: "James Carter",
  phone: "+14075559898",
  notes: "Please call me about a one-time deep clean this week.",
} satisfies HelpConfirmationEmailProps;

export default function HelpConfirmationEmail({
  name,
  phone,
  notes,
  footerAddress,
}: HelpConfirmationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="We received your callback request. Our team will contact you soon."
      title={`We received your request, ${name}`}
      eyebrow="Callback request received"
      footerAddress={footerAddress}
    >
      <Paragraph>
        Thanks for reaching out. Our team will review your request and contact you using the phone
        number below.
      </Paragraph>
      <DetailCard title="Callback details" tone="success">
        <KeyValueRow label="Phone" value={phone} />
      </DetailCard>
      {notes ? (
        <>
          <MutedText>Your note</MutedText>
          <MessageBox>{notes}</MessageBox>
        </>
      ) : null}
      <Paragraph>If your request is urgent, calling is the fastest option.</Paragraph>
      <PrimaryButton href="tel:+18009300532">Call (800) 930-0532</PrimaryButton>
    </EmailLayout>
  );
}
