'use client';

import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { notFound } from "next/navigation";
import { resolveServiceSlugSync, isValidServiceSlugClient } from "@/lib/urls/quote-client";
import QuotePageContent from "../quote-content";

const QuoteServicePageContent = (): React.ReactNode => {
  const params = useParams();
  const searchParams = useSearchParams();
  const slugFromParams = params.service as string;
  
  const initialSlug = slugFromParams ? resolveServiceSlugSync(slugFromParams) : null;
  const isValid = initialSlug ? isValidServiceSlugClient(initialSlug) : false;
  
  const [resolvedSlug] = useState<string | null>(initialSlug);
  const loading = !isValid;

  // If invalid service slug, show 404
  if (!loading && !resolvedSlug) {
    return notFound();
  }

  // Extract additional params from query string
  const additionalParams = {
    name: searchParams.get("name") || undefined,
    email: searchParams.get("email") || undefined,
    phone: searchParams.get("phone") || undefined,
    zipCode: searchParams.get("zipCode") || undefined,
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading quote...</p>
      </div>
    );
  }

  return (
    <QuotePageContent
      serviceSlug={resolvedSlug!}
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
