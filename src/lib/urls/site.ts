import "server-only";

const DEFAULT_LOCAL_URL = "http://localhost:3000";

const normalizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_LOCAL_URL;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const rawSiteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : DEFAULT_LOCAL_URL);

export const SITE_URL = normalizeBaseUrl(rawSiteUrl).replace(/\/$/, "");
export const SITE_URL_OBJECT = new URL(SITE_URL);

export const absoluteUrl = (path: string = "/"): string => {
  return new URL(path, SITE_URL_OBJECT).toString();
};
