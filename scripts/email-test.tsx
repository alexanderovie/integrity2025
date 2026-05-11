import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import { Resend } from "resend";
import {
  emailFixtureNames,
  isEmailFixtureName,
  renderEmailFixture,
} from "./email-fixtures";

config({ path: ".env.local" });
config();

function getArg(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

function getAllowedRecipients(): Set<string> {
  const values = [
    process.env.EMAIL_TEST_ALLOWLIST,
    process.env.TO_EMAIL,
    process.env.CONTACT_EMAIL,
    process.env.HELP_EMAIL,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(","))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return new Set(values);
}

async function main(): Promise<void> {
  const templateName = process.argv[2];
  const to = getArg("--to")?.trim().toLowerCase();
  const dryRun = process.argv.includes("--dry-run");

  if (!templateName || !isEmailFixtureName(templateName) || !to) {
    console.error(`Usage: pnpm email:test <template> --to you@example.com [--dry-run]`);
    console.error(`Templates: ${emailFixtureNames.join(", ")}`);
    process.exit(1);
  }

  const allowedRecipients = getAllowedRecipients();
  if (!allowedRecipients.has(to)) {
    console.error(
      `Refusing to send test email. Add the recipient to EMAIL_TEST_ALLOWLIST, TO_EMAIL, CONTACT_EMAIL, or HELP_EMAIL.`,
    );
    process.exit(1);
  }

  const rendered = await renderEmailFixture(templateName);

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          template: templateName,
          to,
          subject: rendered.subject,
          htmlLength: rendered.html.length,
          textLength: rendered.text.length,
        },
        null,
        2,
      ),
    );
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!resendApiKey || !fromEmail) {
    console.error("RESEND_API_KEY and FROM_EMAIL are required for email:test.");
    process.exit(1);
  }

  const resend = new Resend(resendApiKey);
  const response = await resend.emails.send(
    {
      from: fromEmail,
      to,
      subject: `[Test] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    },
    {
      idempotencyKey: `email-test/${templateName}/${randomUUID()}`,
    },
  );

  if (response.error) {
    console.error(
      JSON.stringify(
        {
          template: templateName,
          to,
          error: response.error.message,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        template: templateName,
        to,
        emailId: response.data?.id,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
