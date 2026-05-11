import type { ReactElement } from "react";
import { Link } from "react-email";
import { Paragraph, PrimaryButton } from "./_components/EmailBlocks";
import { EmailLayout, brand } from "./_components/EmailLayout";
import type { NewsletterWelcomeEmailProps } from "./types";

export const PreviewProps = {
  unsubscribeUrl: "https://integritycleansolutions.com/unsubscribe?token=preview",
} satisfies NewsletterWelcomeEmailProps;

export default function NewsletterWelcomeEmail({
  unsubscribeUrl,
  footerAddress,
}: NewsletterWelcomeEmailProps): ReactElement {
  return (
    <EmailLayout
      preview="Thanks for subscribing to Integrity Clean Solutions."
      title="Thanks for subscribing"
      eyebrow="Newsletter"
      footerAddress={footerAddress}
      transactional={false}
    >
      <Paragraph>
        You will now receive cleaning tips, seasonal offers, and important updates from Integrity
        Clean Solutions.
      </Paragraph>
      <Paragraph>We are excited to help you keep your spaces spotless.</Paragraph>
      <PrimaryButton href="https://integritycleansolutions.com">Visit our website</PrimaryButton>
      {unsubscribeUrl ? (
        <Paragraph>
          You can{" "}
          <Link href={unsubscribeUrl} style={{ color: brand.greenDark }}>
            unsubscribe from marketing emails
          </Link>{" "}
          at any time.
        </Paragraph>
      ) : (
        <Paragraph>
          To unsubscribe, reply to this email and ask to stop receiving marketing emails.
        </Paragraph>
      )}
    </EmailLayout>
  );
}

