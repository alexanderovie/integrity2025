import { notFound } from "next/navigation";
import { resolveServiceSlugSync, isValidServiceSlugClient } from "@/lib/urls/quote-client";
import QuotePageContent from "../quote-content";

type QuoteServicePageProps = {
  params: { service?: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function QuoteServicePage({
  params,
  searchParams = {},
}: QuoteServicePageProps): React.ReactElement {
  const slugFromParams = params.service;
  const resolvedSlug = resolveServiceSlugSync(slugFromParams);

  if (!resolvedSlug || !isValidServiceSlugClient(resolvedSlug)) {
    notFound();
  }

  const additionalParams = {
    name: typeof searchParams.name === "string" ? searchParams.name : undefined,
    email: typeof searchParams.email === "string" ? searchParams.email : undefined,
    phone: typeof searchParams.phone === "string" ? searchParams.phone : undefined,
    zipCode: typeof searchParams.zipCode === "string" ? searchParams.zipCode : undefined,
  };

  return <QuotePageContent serviceSlug={resolvedSlug} initialParams={additionalParams} />;
}
