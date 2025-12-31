'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { resolveServiceSlug, getQuoteUrl } from "@/lib/urls/quote";

/**
 * Legacy Quote Page - Fallback Client-Side Redirect
 *
 * NOTE: Server-side redirect 301 is handled in middleware.ts
 * This is a fallback for edge cases where middleware might not catch the request
 *
 * This page handles legacy URLs with query parameters:
 * - /quote?service=regular-cleaning → /quote/regular-cleaning
 * - /quote?service=deep-cleaning → /quote/deep-cleaning
 *
 * Follows patterns used by:
 * - Stripe: Redirects legacy URLs to new structure
 * - Vercel: Maintains backward compatibility
 * - Linear: Graceful URL migration
 */

const QuoteRedirectContent = (): React.ReactElement => {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Extract service from query params
    const serviceSlug = searchParams.get("service") || searchParams.get("services");
    const resolvedSlug = resolveServiceSlug(serviceSlug);

    // Extract additional params
    const additionalParams = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      phone: searchParams.get("phone") || undefined,
      zipCode: searchParams.get("zipCode") || undefined,
    };

    // If we have a valid service slug, redirect to friendly URL
    if (resolvedSlug) {
      const friendlyUrl = getQuoteUrl(resolvedSlug, additionalParams);
      router.replace(friendlyUrl);
      return;
    }

    // If no service specified, redirect to base quote page (or show form without pre-filled service)
    // For now, redirect to regular-cleaning as default
    router.replace("/quote/regular-cleaning");
  }, [searchParams, router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-secondary/70 dark:text-white/70">Redirecting...</p>
      </div>
    </div>
  );
};

const QuotePage = (): React.ReactElement => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary/70 dark:text-white/70">Loading...</p>
        </div>
      </div>
    }>
      <QuoteRedirectContent />
    </Suspense>
  );
};

export default QuotePage;
