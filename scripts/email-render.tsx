import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  emailFixtureNames,
  isEmailFixtureName,
  renderEmailFixture,
} from "./email-fixtures";

async function main(): Promise<void> {
  const [, , templateName, outputPath] = process.argv;

  if (!templateName || !isEmailFixtureName(templateName)) {
    console.error(`Usage: pnpm email:render <template> [output.html]`);
    console.error(`Templates: ${emailFixtureNames.join(", ")}`);
    process.exit(1);
  }

  const rendered = await renderEmailFixture(templateName);
  const destination = outputPath
    ? resolve(outputPath)
    : resolve("tmp", "email-previews", `${templateName}.html`);

  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, rendered.html, "utf8");

  console.log(
    JSON.stringify(
      {
        template: templateName,
        subject: rendered.subject,
        htmlPath: destination,
        textLength: rendered.text.length,
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
