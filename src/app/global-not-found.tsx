import Link from "next/link";

export default function GlobalNotFound(): React.ReactElement {
  return (
    <html lang="en">
      <body className="min-h-screen bg-offwhite-warm text-secondary dark:bg-dark-gray dark:text-white">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-2 text-sm uppercase tracking-wide text-primary">404</p>
          <h1 className="mb-3 text-3xl font-semibold">Page not found</h1>
          <p className="mb-8 text-secondary/70 dark:text-white/70">
            The page you requested does not exist or may have moved.
          </p>
          <Link
            href="/"
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-white hover:bg-darkPrimary"
          >
            Go to Homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
