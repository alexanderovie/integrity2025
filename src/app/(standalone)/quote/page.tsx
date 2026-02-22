import { getQuoteUrl, resolveServiceSlugSync } from "@/lib/urls/quote-client";
import { redirect } from "next/navigation";

type QuotePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const firstValue = (value: string | string[] | undefined): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
};

export default async function QuotePage({ searchParams }: QuotePageProps): Promise<never> {
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const rawService =
    firstValue(resolvedSearchParams.service) || firstValue(resolvedSearchParams.services);

  const resolvedSlug = resolveServiceSlugSync(rawService);

  const additionalParams = {
    name: firstValue(resolvedSearchParams.name),
    email: firstValue(resolvedSearchParams.email),
    phone: firstValue(resolvedSearchParams.phone),
    zipCode: firstValue(resolvedSearchParams.zipCode),
    preferredDate: firstValue(resolvedSearchParams.preferredDate),
    serviceDate: firstValue(resolvedSearchParams.serviceDate),
    timeSlot: firstValue(resolvedSearchParams.timeSlot),
  };

  if (resolvedSlug) {
    redirect(getQuoteUrl(resolvedSlug, additionalParams));
  }

  redirect("/quote/regular-cleaning");
}
