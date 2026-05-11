import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";
import type { CSSProperties, ReactElement, ReactNode } from "react";

export const brand = {
  green: "#059669",
  greenDark: "#047857",
  blue: "#0369a1",
  amber: "#b45309",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  panel: "#f9fafb",
  successPanel: "#ecfdf5",
  infoPanel: "#eff6ff",
  warningPanel: "#fffbeb",
};

const pageStyle: CSSProperties = {
  margin: 0,
  padding: 0,
  backgroundColor: "#f3f4f6",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
};

const containerStyle: CSSProperties = {
  width: "100%",
  maxWidth: "620px",
  margin: "0 auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden",
};

const headerStyle: CSSProperties = {
  padding: "32px 32px 24px",
  borderBottom: `3px solid ${brand.green}`,
  textAlign: "left",
};

const bodyStyle: CSSProperties = {
  padding: "32px",
};

const footerStyle: CSSProperties = {
  padding: "24px 32px 32px",
  borderTop: `1px solid ${brand.border}`,
  textAlign: "center",
};

const brandNameStyle: CSSProperties = {
  margin: "0 0 4px",
  color: brand.green,
  fontSize: "20px",
  lineHeight: "28px",
  fontWeight: 700,
};

const footerTextStyle: CSSProperties = {
  margin: "0 0 6px",
  color: brand.muted,
  fontSize: "12px",
  lineHeight: "18px",
};

export type EmailLayoutProps = {
  preview: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footerAddress?: string | null;
  transactional?: boolean;
};

export function EmailLayout({
  preview,
  title,
  eyebrow,
  children,
  footerAddress,
  transactional = true,
}: EmailLayoutProps): ReactElement {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={pageStyle}>
        <Section style={{ padding: "32px 16px" }}>
          <Container style={containerStyle}>
            <Section style={headerStyle}>
              {eyebrow ? (
                <Text
                  style={{
                    margin: "0 0 8px",
                    color: brand.greenDark,
                    fontSize: "13px",
                    lineHeight: "18px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {eyebrow}
                </Text>
              ) : null}
              <Heading
                as="h1"
                style={{
                  margin: 0,
                  color: brand.text,
                  fontSize: "26px",
                  lineHeight: "34px",
                  fontWeight: 700,
                }}
              >
                {title}
              </Heading>
            </Section>

            <Section style={bodyStyle}>{children}</Section>

            <Section style={footerStyle}>
              <Text style={brandNameStyle}>Integrity Clean Solutions</Text>
              <Text style={footerTextStyle}>Professional cleaning services in Central Florida.</Text>
              <Text style={footerTextStyle}>
                <Link href="https://integritycleansolutions.com" style={{ color: brand.greenDark }}>
                  integritycleansolutions.com
                </Link>{" "}
                | info@integritycleansolutions.com
              </Text>
              {footerAddress ? <Text style={footerTextStyle}>{footerAddress}</Text> : null}
              <Hr style={{ borderColor: brand.border, margin: "18px 0" }} />
              <Text style={footerTextStyle}>
                {transactional
                  ? "This is a transactional email related to your request or service."
                  : "You are receiving this because you subscribed to updates from Integrity Clean Solutions."}
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}

