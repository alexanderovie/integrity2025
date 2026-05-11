import type { ReactElement } from "react";
import { DetailCard, KeyValueRow, MessageBox, MutedText, Paragraph } from "./_components/EmailBlocks";
import { EmailLayout } from "./_components/EmailLayout";
import type { JobApplicationTeamNotificationEmailProps } from "./types";

export const PreviewProps = {
  name: "Ana Lopez",
  email: "ana@example.com",
  phone: "+14075550000",
  city: "Orlando, FL",
  role: "Cleaner",
  availability: "Weekdays",
  startDate: "2026-05-20",
  experienceYears: "3",
  workAuthorization: "Authorized to work in the U.S.",
  transportation: "Has reliable transportation",
  references: "Available on request.",
  summary: "I have experience with residential and office cleaning.",
} satisfies JobApplicationTeamNotificationEmailProps;

export default function JobApplicationTeamNotificationEmail({
  name,
  email,
  phone,
  city,
  role,
  availability,
  startDate,
  experienceYears,
  workAuthorization,
  transportation,
  references,
  summary,
  footerAddress,
}: JobApplicationTeamNotificationEmailProps): ReactElement {
  return (
    <EmailLayout
      preview={`New job application from ${name}`}
      title="New Join Our Team Submission"
      eyebrow="Hiring pipeline"
      footerAddress={footerAddress}
    >
      <Paragraph>A new candidate submitted the Join Our Team form.</Paragraph>
      <DetailCard title="Candidate details" tone="success">
        <KeyValueRow label="Name" value={name} />
        <KeyValueRow label="Email" value={email} />
        <KeyValueRow label="Phone" value={phone} />
        <KeyValueRow label="City/ZIP" value={city} />
        <KeyValueRow label="Role" value={role} />
        <KeyValueRow label="Availability" value={availability} />
        {startDate ? <KeyValueRow label="Start date" value={startDate} /> : null}
        {experienceYears ? <KeyValueRow label="Experience" value={`${experienceYears} years`} /> : null}
        <KeyValueRow label="Work authorization" value={workAuthorization} />
        <KeyValueRow label="Transportation" value={transportation} />
      </DetailCard>
      {references ? (
        <>
          <MutedText>References</MutedText>
          <MessageBox>{references}</MessageBox>
        </>
      ) : null}
      <MutedText>Summary</MutedText>
      <MessageBox>{summary}</MessageBox>
    </EmailLayout>
  );
}

