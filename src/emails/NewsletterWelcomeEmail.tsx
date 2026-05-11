import type { CSSProperties, ReactElement, ReactNode } from "react";
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
import type { NewsletterWelcomeEmailProps } from "./types";

const companyName = "Integrity Clean Solutions";
const siteUrl = "https://integritycleansolutions.com";
const logoUrl = `${siteUrl}/images/logo/integrity-navbar.png`;
const heroUrl = `${siteUrl}/images/og/professional-cleaning.jpg`;
const deepCleaningUrl = `${siteUrl}/images/services/deep-cleaning.jpg`;
const commercialCleaningUrl = `${siteUrl}/images/services/commercial-office-cleaning-1.jpg`;

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

export const PreviewProps = {
  unsubscribeUrl: "https://integritycleansolutions.com/api/marketing/unsubscribe?token=preview",
} satisfies NewsletterWelcomeEmailProps;

function ResponsiveHead(): ReactElement {
  return (
    <Head>
      <style>
        {`
          @media only screen and (max-width: 600px) {
            .shell { margin-top: 0 !important; }
            .outer { padding: 0 !important; }
            .header-pad { padding-left: 16px !important; padding-right: 16px !important; }
            .hero-card { margin-left: 8px !important; margin-right: 8px !important; padding: 18px 16px 36px !important; }
            .green-card { width: 100% !important; padding: 30px 16px !important; border-left: 0 !important; border-right: 0 !important; border-radius: 0 !important; box-sizing: border-box !important; }
            .content-card { margin-left: 8px !important; margin-right: 8px !important; padding: 28px 18px !important; }
            .stack { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
            .stack-gap { display: block !important; width: 100% !important; max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; padding-bottom: 26px !important; }
            .mobile-img { width: 100% !important; max-width: 100% !important; margin-left: auto !important; margin-right: auto !important; }
            .h1 { font-size: 31px !important; line-height: 39px !important; }
            .h2 { font-size: 24px !important; line-height: 32px !important; text-align: center !important; }
            .button { display: block !important; width: 100% !important; box-sizing: border-box !important; }
          }
        `}
      </style>
    </Head>
  );
}

export default function NewsletterWelcomeEmail({
  unsubscribeUrl,
  footerAddress,
}: NewsletterWelcomeEmailProps): ReactElement {
  return (
    <Html lang="en" dir="ltr">
      <ResponsiveHead />
      <Preview>Welcome to {companyName}. Thanks for subscribing.</Preview>
      <Body style={{ margin: 0, backgroundColor: color.page, fontFamily }}>
        <Container className="shell" style={shellStyle}>
          <Section className="outer" style={outerStyle}>
            <Header />
            <Hero />
            <ExpectationCard />
            <HelpCard />
            <Footer footerAddress={footerAddress} unsubscribeUrl={unsubscribeUrl} />
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
            Newsletter
          </Text>
        </Column>
      </Row>
    </Section>
  );
}

function Hero(): ReactElement {
  return (
    <Section className="hero-card" style={heroCardStyle}>
      <Section style={{ marginBottom: "34px" }}>
        <Img
          src={heroUrl}
          alt="Professional cleaning service"
          width="600"
          style={{ display: "block", width: "100%", maxWidth: "600px", borderRadius: "12px" }}
        />
      </Section>
      <Section style={{ maxWidth: "430px", margin: "0 auto", textAlign: "center" }}>
        <Text style={eyebrowStyle}>Thanks for subscribing</Text>
        <Heading as="h1" className="h1" style={heroHeadingStyle}>
          Welcome to Integrity Clean Solutions
        </Heading>
        <Text style={heroCopyStyle}>
          You will now receive cleaning tips, helpful reminders, and service updates for homes and
          businesses in Central Florida.
        </Text>
      </Section>
    </Section>
  );
}

function ExpectationCard(): ReactElement {
  return (
    <Section className="green-card" style={greenCardStyle}>
      <Heading as="h2" className="h2" style={centeredHeadingStyle}>
        What you can expect
      </Heading>
      <Row>
        <Column className="stack-gap" style={{ width: "50%", paddingRight: "18px", verticalAlign: "top" }}>
          <MiniBlock imageUrl={deepCleaningUrl} imageAlt="Residential deep cleaning" title="Practical tips">
            Simple ideas to help keep your spaces clean between professional services.
          </MiniBlock>
        </Column>
        <Column className="stack" style={{ width: "50%", paddingLeft: "18px", verticalAlign: "top" }}>
          <MiniBlock
            imageUrl={commercialCleaningUrl}
            imageAlt="Professional commercial cleaning"
            title="Helpful reminders"
          >
            Seasonal and routine reminders for the moments when professional cleaning helps most.
          </MiniBlock>
        </Column>
      </Row>
    </Section>
  );
}

function HelpCard(): ReactElement {
  return (
    <Section className="content-card" style={contentCardStyle}>
      <Heading as="h2" className="h2" style={sectionHeadingStyle}>
        When you need help
      </Heading>
      <Text style={sectionCopyStyle}>
        You can request a quote, review our services, or contact the team to coordinate the best
        option for your space.
      </Text>
      <Section style={{ textAlign: "center" }}>
        <Button href={`${siteUrl}/contact-us`} className="button" style={buttonStyle}>
          Contact the team
        </Button>
      </Section>
    </Section>
  );
}

function MiniBlock({
  imageUrl,
  imageAlt,
  title,
  children,
}: {
  imageUrl: string;
  imageAlt: string;
  title: string;
  children: ReactNode;
}): ReactElement {
  return (
    <Section>
      <Img
        className="mobile-img"
        src={imageUrl}
        alt={imageAlt}
        width="246"
        style={{
          display: "block",
          width: "100%",
          maxWidth: "246px",
          borderRadius: "10px",
          margin: "0 auto 18px",
        }}
      />
      <Text style={miniTitleStyle}>{title}</Text>
      <Text style={miniCopyStyle}>{children}</Text>
    </Section>
  );
}

function Footer({
  footerAddress,
  unsubscribeUrl,
}: {
  footerAddress?: string | null;
  unsubscribeUrl?: string | null;
}): ReactElement {
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
      {unsubscribeUrl ? (
        <Text style={footerLineStyle}>
          <Link href={unsubscribeUrl} style={{ color: color.greenDark }}>
            Unsubscribe
          </Link>{" "}
          from Integrity Clean Solutions marketing emails.
        </Text>
      ) : (
        <Text style={footerLineStyle}>
          To unsubscribe, reply to this email and ask to stop receiving marketing emails.
        </Text>
      )}
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
  padding: "20px 20px 44px",
  backgroundColor: color.panel,
  borderRadius: "12px",
};

const greenCardStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "38px 30px",
  backgroundColor: color.softGreen,
  border: `1px solid ${color.border}`,
  borderRadius: "12px",
};

const contentCardStyle: CSSProperties = {
  marginBottom: "14px",
  padding: "36px 30px",
  backgroundColor: color.panel,
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

const centeredHeadingStyle: CSSProperties = {
  margin: "0 0 28px",
  color: color.text,
  fontSize: "28px",
  lineHeight: "36px",
  textAlign: "center",
};

const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 22px",
  color: color.text,
  fontSize: "26px",
  lineHeight: "34px",
};

const sectionCopyStyle: CSSProperties = {
  margin: "0 0 26px",
  color: color.muted,
  fontSize: "16px",
  lineHeight: "27px",
};

const miniTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  color: color.greenDark,
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: 700,
  textAlign: "center",
};

const miniCopyStyle: CSSProperties = {
  margin: 0,
  color: color.muted,
  fontSize: "15px",
  lineHeight: "24px",
  textAlign: "center",
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
