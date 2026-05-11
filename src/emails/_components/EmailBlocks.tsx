import { Button, Column, Heading, Row, Section, Text } from "react-email";
import type { CSSProperties, ReactElement, ReactNode } from "react";
import { brand } from "./EmailLayout";

const paragraphStyle: CSSProperties = {
  margin: "0 0 16px",
  color: brand.text,
  fontSize: "15px",
  lineHeight: "24px",
};

const labelStyle: CSSProperties = {
  margin: 0,
  color: brand.muted,
  fontSize: "13px",
  lineHeight: "18px",
};

const valueStyle: CSSProperties = {
  margin: 0,
  color: brand.text,
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: 600,
};

export function Paragraph({ children }: { children: ReactNode }): ReactElement {
  return <Text style={paragraphStyle}>{children}</Text>;
}

export function MutedText({ children }: { children: ReactNode }): ReactElement {
  return (
    <Text
      style={{
        margin: "0 0 12px",
        color: brand.muted,
        fontSize: "13px",
        lineHeight: "20px",
      }}
    >
      {children}
    </Text>
  );
}

export function DetailCard({
  title,
  children,
  tone = "neutral",
}: {
  title?: string;
  children: ReactNode;
  tone?: "neutral" | "success" | "info" | "warning";
}): ReactElement {
  const colorByTone = {
    neutral: brand.border,
    success: brand.green,
    info: brand.blue,
    warning: brand.amber,
  };
  const backgroundByTone = {
    neutral: brand.panel,
    success: brand.successPanel,
    info: brand.infoPanel,
    warning: brand.warningPanel,
  };

  return (
    <Section
      style={{
        margin: "0 0 20px",
        padding: "18px",
        backgroundColor: backgroundByTone[tone],
        borderLeft: `4px solid ${colorByTone[tone]}`,
        borderRadius: "6px",
      }}
    >
      {title ? (
        <Heading
          as="h2"
          style={{
            margin: "0 0 12px",
            color: colorByTone[tone],
            fontSize: "17px",
            lineHeight: "24px",
          }}
        >
          {title}
        </Heading>
      ) : null}
      {children}
    </Section>
  );
}

export function KeyValueRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}): ReactElement {
  return (
    <Row style={{ margin: "0 0 10px" }}>
      <Column style={{ width: "44%", paddingRight: "12px", verticalAlign: "top" }}>
        <Text style={labelStyle}>{label}</Text>
      </Column>
      <Column style={{ width: "56%", verticalAlign: "top" }}>
        <Text style={valueStyle}>{value}</Text>
      </Column>
    </Row>
  );
}

export function MessageBox({ children }: { children: ReactNode }): ReactElement {
  return (
    <Section
      style={{
        margin: "8px 0 18px",
        padding: "14px",
        backgroundColor: "#f3f4f6",
        borderRadius: "6px",
      }}
    >
      <Text
        style={{
          margin: 0,
          color: brand.text,
          fontSize: "14px",
          lineHeight: "22px",
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </Text>
    </Section>
  );
}

export function ActionList({ items }: { items: string[] }): ReactElement {
  return (
    <Section>
      {items.map((item) => (
        <Text
          key={item}
          style={{
            margin: "0 0 8px",
            color: brand.text,
            fontSize: "14px",
            lineHeight: "22px",
          }}
        >
          - {item}
        </Text>
      ))}
    </Section>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): ReactElement {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: brand.green,
        borderRadius: "6px",
        color: "#ffffff",
        display: "inline-block",
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "20px",
        padding: "12px 18px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

