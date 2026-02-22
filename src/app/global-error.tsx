'use client';

import Link from "next/link";
import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps): React.ReactElement {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-offwhite-warm text-secondary dark:bg-dark-gray dark:text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-2 text-sm uppercase tracking-wide text-primary">Unexpected Error</p>
          <h1 className="mb-3 text-3xl font-semibold">Something went wrong</h1>
          <p className="mb-8 text-secondary/70 dark:text-white/70">
            We could not complete this request. You can try again or return to the homepage.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:bg-darkPrimary"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="rounded-md border border-secondary/30 px-5 py-2.5 font-medium hover:border-primary hover:text-primary dark:border-white/30"
            >
              Back Home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
