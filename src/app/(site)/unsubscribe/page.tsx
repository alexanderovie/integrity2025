import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unsubscribe | Integrity Clean Solutions",
  description: "Manage marketing email subscription status for Integrity Clean Solutions.",
  robots: {
    index: false,
    follow: false,
  },
};

type UnsubscribePageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const isSuccess = params.status === "success";

  return (
    <main className="min-h-[70vh] bg-white dark:bg-secondary">
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
            Email preferences
          </p>
          <h1 className="mb-5 text-4xl font-bold text-secondary dark:text-white">
            {isSuccess ? "You have been unsubscribed" : "We could not process this link"}
          </h1>
          <p className="mb-8 text-lg leading-8 text-secondary/75 dark:text-white/75">
            {isSuccess
              ? "You will no longer receive marketing emails from Integrity Clean Solutions at this address. Transactional emails related to requests, applications, or payments may still be sent when needed."
              : "This unsubscribe link may be missing, expired, or already replaced by a newer subscription link. You can contact our team if you need help updating your email preferences."}
          </p>
          <Link
            href="/contact-us"
            className="inline-flex rounded-md bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-deep-blue"
          >
            Contact the team
          </Link>
        </div>
      </section>
    </main>
  );
}
