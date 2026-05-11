#!/usr/bin/env node

import { Resend } from "resend";

const EVENTS = [
  "email.sent",
  "email.delivered",
  "email.delivery_delayed",
  "email.bounced",
  "email.complained",
  "email.failed",
  "email.suppressed",
  "email.opened",
  "email.clicked",
];

const command = process.argv[2] || "status";

if (!["status", "enable", "disable"].includes(command)) {
  console.error("Usage: node scripts/ops/resend-webhook-status.mjs [status|enable|disable]");
  process.exit(1);
}

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is required.");
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.error("NEXT_PUBLIC_APP_URL is required.");
  process.exit(1);
}

const endpoint = `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/api/webhooks/resend`;
const resend = new Resend(process.env.RESEND_API_KEY);

const failOnProviderError = (response, action) => {
  if (response.error) {
    throw new Error(response.error.message || `Resend ${action} failed.`);
  }
  return response.data;
};

const list = await resend.webhooks.list();
const data = failOnProviderError(list, "webhook list");
const webhook = data.data.find((item) => item.endpoint === endpoint);

if (!webhook) {
  console.error(`No Resend webhook found for ${endpoint}`);
  process.exit(1);
}

if (command === "enable" || command === "disable") {
  const status = command === "enable" ? "enabled" : "disabled";
  const update = await resend.webhooks.update(webhook.id, {
    events: EVENTS,
    status,
  });
  failOnProviderError(update, "webhook update");
}

const refreshed = await resend.webhooks.get(webhook.id);
const current = failOnProviderError(refreshed, "webhook get");

console.log(JSON.stringify({
  id: current.id,
  endpoint: current.endpoint,
  status: current.status,
  events: current.events,
}, null, 2));
