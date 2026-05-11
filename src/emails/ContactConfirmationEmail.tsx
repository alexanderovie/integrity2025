import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, Paragraph, PrimaryButton } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { ContactConfirmationEmailProps } from "./types";

export const PreviewProps = {
  name: "Maria Rivera",
  phone: "+14075551212",
} satisfies ContactConfirmationEmailProps;

export default function ContactConfirmationEmail({
  name,
  phone,
  footerAddress,
}: ContactConfirmationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="We received your message and will contact you soon."
      title={`Thanks for reaching out, ${name}`}
      eyebrow="Message received"
      footerAddress={footerAddress}
    >
      <Paragraph>
        We received your message and our team will review it shortly. A coordinator will contact
        you using the phone number below.
      </Paragraph>
      <DetailCard title="Contact on file" tone="success">
        <KeyValueRow label="Phone" value={phone} />
      </DetailCard>
      <Paragraph>If your request is urgent, you can call us directly at (800) 930-0532.</Paragraph>
      <PrimaryButton href="https://integritycleansolutions.com/contact-us">
        Contact Integrity Clean Solutions
      </PrimaryButton>
    </EmailLayout>
  );
}
