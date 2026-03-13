import type { Metadata } from "next";
import { StudioApp } from "@/components/studio/StudioApp";
import { isSanityEnabled } from "@/sanity/lib/client";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Content Studio | Integrity Clean Solutions",
};

export { viewport } from "next-sanity/studio";

export default function StudioPage() {
  if (!isSanityEnabled) {
    return (
      <main className="container py-24">
        <div className="mx-auto max-w-2xl rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-secondary">
            Sanity is not configured yet
          </h1>
          <p className="mt-4 text-base text-secondary/80">
            Add `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` to enable the editor for the blog owner.
          </p>
        </div>
      </main>
    );
  }

  return <StudioApp />;
}
