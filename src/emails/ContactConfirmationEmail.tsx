import type { CSSProperties, ReactElement } from "react";
import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "react-email";
import type { ContactConfirmationEmailProps } from "./types";

const companyName = "Integrity Clean Solutions";
const siteUrl = "https://integritycleansolutions.com";
const logoUrl = `${siteUrl}/images/logo/integrity-navbar.png`;
const phoneDisplay = "(800) 930-0532";
const phoneHref = "tel:+18009300532";

const color = {
  page: "#f3f4f6",
  white: "#ffffff",
  panel: "#f8fafc",
  softGreen: "#f0fdf4",
  text: "#111827",
  muted: "#64748b",
  border: "#e5e7eb",
  green: "#059669",
  greenDark: "#047857",
};

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

function getPreviewMessage(message?: string | null): string | null {
  const cleanMessage = message?.trim();
  if (!cleanMessage) return null;

  return cleanMessage.length > 520 ? `${cleanMessage.slice(0, 517)}...` : cleanMessage;
}

export const PreviewProps = {
  name: "Maria Rivera",
  phone: "+14075551212",
  service: "Residential cleaning",
  message: "I would like a quote for recurring cleaning service next week.",
} satisfies ContactConfirmationEmailProps;

function ResponsiveHead(): ReactElement {
  return (
    <Head>
      <style>
        {`
          @media only screen and (max-width: 600px) {
            .shell { margin-top: 0 !important; }
            .outer { padding: 0 !important; }
            .header-pad { padding-left: 16px !important; padding-right: 16px !important; }
            .hero-card { margin-left: 8px !important; margin-right: 8px !important; padding: 30px 18px 38px !important; }
            .summary-card { margin-left: 8px !important; margin-right: 8px !important; padding: 28px 18px !important; }
            .support-card { width: 100% !important; padding: 30px 18px !important; border-left: 0 !important; border-right: 0 !important; border-radius: 0 !important; box-sizing: border-box !important; }
            .h1 { font-size: 31px !important; line-height: 39px !important; }
            .h2 { font-size: 24px !important; line-height: 32px !important; text-align: center !important; }
            .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
            .mobile-center { text-align: center !important; }
            .stack { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
          }
        `}
      </style>
    </Head>
  );
}

export default function ContactConfirmationEmail({
  name,
  phone,
  service,
  message,
  footerAddress,
}: ContactConfirmationEmailProps): ReactElement {
  return (
    <Html lang="en" dir="ltr">
      <ResponsiveHead />
      <Preview>We received your message. Our team will contact you soon.</Preview>
      <Body style={{ margin: 0, backgroundColor: color.page, fontFamily }}>
        <Container className="shell" style={shellStyle}>
          <Section className="outer" style={outerStyle}>
            <Header />
            <Hero name={name} />
            <SummaryCard phone={phone} service={service} message={message} />
            <SupportCard />
            <Footer footerAddress={footerAddress} />
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Header(): ReactElement {
  return (
    <Section className="header-pad" style={headerPadStyle}>
      <Row>
        <Column style={{ width: "55%", padding: "8px 0", verticalAlign: "middle" }}>
          <Img src={logoUrl} alt={companyName} width="150" style={{ display: "block" }} />
        </Column>
        <Column align="right" style={{ width: "45%", padding: "8px 0", verticalAlign: "middle" }}>
          <Text style={{ margin: 0, color: color.muted, fontSize: "13px", lineHeight: "18px" }}>
            Contact request
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function Hero({ name }: { name: string }): ReactElement {
  return (
    <Section className="hero-card" style={heroCardStyle}>
      <Section style={{ maxWidth: "460px", margin: "0 auto", textAlign: "center" }}>
        <Text style={eyebrowStyle}>Message received</Text>
        <Heading as="h1" className="h1" style={heroHeadingStyle}>
          Thanks for reaching out, {name}
        </Heading>
        <Text style={heroCopyStyle}>
          We received your message. A coordinator will review the details and contact you soon.
        </Text>
      </Section>
    </Section>
  );
}

function SummaryCard({
  phone,
  service,
  message,
}: {
  phone: string;
  service?: string | null;
  message?: string | null;
}): ReactElement {
  const cleanMessage = getPreviewMessage(message);

  return (
    <Section className="summary-card" style={summaryCardStyle}>
      <Heading as="h2" className="h2" style={sectionHeadingStyle}>
        Request summary
      </Heading>
      <KeyValue label="Phone" value={phone} />
      {service ? <KeyValue label="Service" value={service} /> : null}
      <KeyValue label="Source" value="Contact form" />
      {cleanMessage ? (
        <Section style={messageBoxStyle}>
          <Text style={messageLabelStyle}>Message</Text>
          <Text style={messageTextStyle}>{cleanMessage}</Text>
        </Section>
      ) : null}
    </Section>
  );
}

function SupportCard(): ReactElement {
  return (
    <Section className="support-card" style={supportCardStyle}>
      <Heading as="h2" className="h2" style={centeredHeadingStyle}>
        Need to add details?
      </Heading>
      <Text style={centeredCopyStyle}>
        Reply to this email or call us. If your request is urgent, calling is the fastest option.
      </Text>
      <Section style={{ textAlign: "center", marginBottom: "18px" }}>
        <Button href={phoneHref} className="button" style={buttonStyle}>
          Call {phoneDisplay}
        </Button>
      </Section>
      <Text style={secondaryLinkStyle}>
        <Link href={`${siteUrl}/services`} style={{ color: color.greenDark }}>
          View cleaning services
        </Link>
      </Text>
    </Section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <Row style={{ marginBottom: "14px" }}>
      <Column className="stack" style={{ width: "34%", paddingRight: "14px", verticalAlign: "top" }}>
        <Text style={labelStyle}>{label}</Text>
      </Column>
      <Column className="stack" style={{ width: "66%", verticalAlign: "top" }}>
        <Text style={valueStyle}>{value}</Text>
      </Column>
    </Row>
  );
}

function Footer({ footerAddress }: { footerAddress?: string | null }): ReactElement {
  return (
    <Section style={footerStyle}>
      <Text style={footerBrandStyle}>{companyName}</Text>
      <Text style={footerCopyStyle}>
        Professional residential and commercial cleaning services in Central Florida.
      </Text>
      <Text style={footerLineStyle}>
        <Link href={siteUrl} style={{ color: color.greenDark }}>
          integritycleansolutions.com
        </Link>{" "}
        | info@integritycleansolutions.com
      </Text>
      {footerAddress ? <Text style={footerLineStyle}>{footerAddress}</Text> : null}
      <Text style={footerLineStyle}>
        This is a transactional email related to your contact request.
      </Text>
    </Section>
  );
}

const shellStyle: CSSProperties = {
  width: "100%",
  maxWidth: "640px",
  margin: "32px auto 0",
};

const outerStyle: CSSProperties = {
  backgroundColor: color.white,
  padding: "16px 24px",
};

const headerPadStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "0 24px",
};

const heroCardStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "42px 30px 46px",
  backgroundColor: color.panel,
  borderRadius: "12px",
};

const summaryCardStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "36px 30px",
  backgroundColor: color.panel,
  borderRadius: "12px",
};

const supportCardStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "38px 30px",
  backgroundColor: color.softGreen,
  border: `1px solid ${color.border}`,
  borderRadius: "12px",
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 18px",
  color: color.greenDark,
  fontSize: "13px",
  lineHeight: "18px",
  fontWeight: 700,
};

const heroHeadingStyle: CSSProperties = {
  margin: "0 0 20px",
  color: color.text,
  fontSize: "38px",
  lineHeight: "46px",
};

const heroCopyStyle: CSSProperties = {
  margin: 0,
  color: color.muted,
  fontSize: "16px",
  lineHeight: "27px",
};

const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 24px",
  color: color.text,
  fontSize: "26px",
  lineHeight: "34px",
};

const centeredHeadingStyle: CSSProperties = {
  margin: "0 0 18px",
  color: color.text,
  fontSize: "26px",
  lineHeight: "34px",
  textAlign: "center",
};

const centeredCopyStyle: CSSProperties = {
  margin: "0 auto 26px",
  maxWidth: "430px",
  color: color.muted,
  fontSize: "16px",
  lineHeight: "27px",
  textAlign: "center",
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: color.muted,
  fontSize: "13px",
  lineHeight: "19px",
};

const valueStyle: CSSProperties = {
  margin: 0,
  color: color.text,
  fontSize: "15px",
  lineHeight: "22px",
  fontWeight: 700,
};

const messageBoxStyle: CSSProperties = {
  marginTop: "10px",
  padding: "18px",
  backgroundColor: color.white,
  border: `1px solid ${color.border}`,
  borderRadius: "10px",
};

const messageLabelStyle: CSSProperties = {
  margin: "0 0 8px",
  color: color.greenDark,
  fontSize: "13px",
  lineHeight: "18px",
  fontWeight: 700,
};

const messageTextStyle: CSSProperties = {
  margin: 0,
  color: color.text,
  fontSize: "15px",
  lineHeight: "24px",
};

const buttonStyle: CSSProperties = {
  display: "inline-block",
  backgroundColor: color.green,
  color: "#ffffff",
  borderRadius: "8px",
  fontSize: "16px",
  lineHeight: "24px",
  fontWeight: 700,
  textAlign: "center",
  textDecoration: "none",
  padding: "14px 28px",
};

const secondaryLinkStyle: CSSProperties = {
  margin: 0,
  color: color.muted,
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center",
};

const footerStyle: CSSProperties = {
  padding: "36px 24px 30px",
  textAlign: "center",
};

const footerBrandStyle: CSSProperties = {
  margin: "0 0 10px",
  color: color.text,
  fontSize: "15px",
  lineHeight: "22px",
  fontWeight: 700,
};

const footerCopyStyle: CSSProperties = {
  margin: "0 auto 18px",
  maxWidth: "340px",
  color: color.muted,
  fontSize: "13px",
  lineHeight: "21px",
};

const footerLineStyle: CSSProperties = {
  margin: "0 0 8px",
  color: color.muted,
  fontSize: "12px",
  lineHeight: "19px",
};
