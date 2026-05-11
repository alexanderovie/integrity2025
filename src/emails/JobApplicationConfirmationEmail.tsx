import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { JobApplicationConfirmationEmailProps } from "./types";

export const PreviewProps = {
  name: "Ana Lopez",
  phone: "+14075550000",
} satisfies JobApplicationConfirmationEmailProps;

export default function JobApplicationConfirmationEmail({
  name,
  phone,
  footerAddress,
}: JobApplicationConfirmationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="We received your application."
      title={`Thanks for applying, ${name}`}
      eyebrow="Application received"
      footerAddress={footerAddress}
    >
      <Paragraph>We received your application and our team will review it shortly.</Paragraph>
      <Paragraph>
        If your experience matches what we need, we will contact you using the phone number below.
      </Paragraph>
      <DetailCard title="Contact on file" tone="neutral">
        <KeyValueRow label="Phone" value={phone} />
      </DetailCard>
      <Paragraph>Thank you for your interest in Integrity Clean Solutions.</Paragraph>
    </EmailLayout>
  );
}

