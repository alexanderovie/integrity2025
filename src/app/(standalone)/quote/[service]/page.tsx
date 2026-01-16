'use client';

import { useParams, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { resolveServiceSlug, isValidServiceSlug } from "@/lib/urls/quote";
import QuotePageContent from "../quote-content";

/**
 * Dynamic Quote Page - Enterprise-Grade URL Structure
 *
 * Follows patterns used by:
 * - Stripe: /pricing/[plan]
 * - Vercel: /pricing/[tier]
 * - Linear: /pricing/[plan]
 *
 * URL Structure:
 * - /quote/regular-cleaning (friendly, SEO-optimized)
 * - /quote/deep-cleaning
 * - /quote/move-in-out-cleaning
 *
 * Instead of:
 * - /quote?service=regular-cleaning (not friendly)
 */

const QuoteServicePageContent = (): React.ReactElement => {
  const params = useParams();
  const searchParams = useSearchParams();

  const serviceSlug = params.service as string;
  const resolvedSlug = resolveServiceSlug(serviceSlug);

  // If invalid service slug, show 404
  if (!resolvedSlug || !isValidServiceSlug(resolvedSlug)) {
    notFound();
  }

  // Extract additional params from query string (name, email, phone, zipCode)
  const additionalParams = {
    name: searchParams.get("name") || undefined,
    email: searchParams.get("email") || undefined,
    phone: searchParams.get("phone") || undefined,
    zipCode: searchParams.get("zipCode") || undefined,
  };

  return (
    <QuotePageContent
      serviceSlug={resolvedSlug}
      initialParams={additionalParams}
    />
  );
};

const QuoteServicePage = (): React.ReactElement => {
  return (
    <Suspense fallback={<div className="py-20 text-center">Loading quote...</div>}>
      <QuoteServicePageContent />
    </Suspense>
  );
};

export default QuoteServicePage;
