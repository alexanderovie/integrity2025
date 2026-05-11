import type { ReactElement } from "react";
import { ActionList, DetailCard, KeyValueRow, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { PaymentTeamNotificationEmailProps } from "./types";

export const PreviewProps = {
  transactionId: "cs_test_1234567890abcdef",
  customerName: "Maria Rivera",
  customerEmail: "maria@example.com",
  amount: "$149.00",
  serviceId: "standard-cleaning",
  paidAt: "May 11, 2026, 8:45 PM",
} satisfies PaymentTeamNotificationEmailProps;

export default function PaymentTeamNotificationEmail({
  transactionId,
  customerName,
  customerEmail,
  amount,
  serviceId,
  paidAt,
  footerAddress,
}: PaymentTeamNotificationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview={`New payment received from ${customerName}.`}
      title="New Payment Received"
      eyebrow="Payment notification"
      footerAddress={footerAddress}
    >
      <Paragraph>A successful payment has been processed.</Paragraph>
      <DetailCard title="Payment information" tone="success">
        <KeyValueRow label="Transaction ID" value={transactionId} />
        <KeyValueRow label="Customer" value={customerName} />
        <KeyValueRow label="Customer email" value={customerEmail} />
        <KeyValueRow label="Amount" value={amount} />
        {serviceId ? <KeyValueRow label="Service" value={serviceId} /> : null}
        <KeyValueRow label="Date and time" value={paidAt} />
      </DetailCard>
      <DetailCard title="Required actions" tone="info">
        <ActionList
          items={[
            "Contact the customer to coordinate the service.",
            "Schedule the service date and time.",
            "Prepare the team and required supplies.",
            "Send a reminder before the service.",
          ]}
        />
      </DetailCard>
    </EmailLayout>
  );
}

