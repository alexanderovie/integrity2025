import type { ReactElement } from "react";
import { ActionList, DetailCard, KeyValueRow, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { PaymentConfirmationEmailProps } from "./types";

export const PreviewProps = {
  customerName: "Maria Rivera",
  transactionId: "cs_test_1234567890abcdef",
  amount: "$149.00",
  paidAt: "May 11, 2026",
  propertySize: "1800",
  bedrooms: "3",
  bathrooms: "2",
  frequency: "Bi-weekly",
} satisfies PaymentConfirmationEmailProps;

export default function PaymentConfirmationEmail({
  customerName,
  transactionId,
  amount,
  paidAt,
  propertySize,
  bedrooms,
  bathrooms,
  frequency,
  footerAddress,
}: PaymentConfirmationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="Your payment was received and your cleaning service is confirmed."
      title="Payment Confirmed"
      eyebrow="Service confirmation"
      footerAddress={footerAddress}
    >
      <Paragraph>
        Dear {customerName}, thank you for choosing Integrity Clean Solutions. We received your
        payment and your service is confirmed.
      </Paragraph>
      <DetailCard title="Payment details" tone="success">
        <KeyValueRow label="Transaction ID" value={transactionId} />
        <KeyValueRow label="Amount paid" value={amount} />
        <KeyValueRow label="Payment date" value={paidAt} />
        <KeyValueRow label="Status" value="Confirmed" />
      </DetailCard>
      {propertySize ? (
        <DetailCard title="Service details" tone="info">
          <KeyValueRow
            label="Property"
            value={`${propertySize} sq ft${bedrooms ? `, ${bedrooms} bedrooms` : ""}${
              bathrooms ? `, ${bathrooms} bathrooms` : ""
            }`}
          />
          {frequency ? <KeyValueRow label="Frequency" value={frequency} /> : null}
        </DetailCard>
      ) : null}
      <DetailCard title="Next steps" tone="warning">
        <ActionList
          items={[
            "Our team will contact you within the next 24 hours to coordinate details.",
            "We will confirm the service date and time based on your preference.",
            "You will receive a reminder before the scheduled appointment.",
          ]}
        />
      </DetailCard>
      <Paragraph>If you have questions about your service, contact us at info@integritycleansolutions.com.</Paragraph>
    </EmailLayout>
  );
}

