import { notFound } from "next/navigation";
import { resolveServiceSlugSync, isValidServiceSlugClient } from "@/lib/urls/quote-client";
import QuotePageContent from "../quote-content";

type QuoteServicePageProps = {
  params: Promise<{ service?: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuoteServicePage({
  params,
  searchParams,
}: QuoteServicePageProps): Promise<React.ReactElement> {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const slugFromParams = resolvedParams.service;
  const resolvedSlug = resolveServiceSlugSync(slugFromParams);

  if (!resolvedSlug || !isValidServiceSlugClient(resolvedSlug)) {
    notFound();
  }

  const additionalParams = {
    name: typeof resolvedSearchParams.name === "string" ? resolvedSearchParams.name : undefined,
    email: typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : undefined,
    phone: typeof resolvedSearchParams.phone === "string" ? resolvedSearchParams.phone : undefined,
    zipCode: typeof resolvedSearchParams.zipCode === "string" ? resolvedSearchParams.zipCode : undefined,
  };

  return <QuotePageContent serviceSlug={resolvedSlug} initialParams={additionalParams} />;
}
