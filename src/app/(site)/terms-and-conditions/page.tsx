import TermsAndConditions from "@/components/TermsAndConditions";
import { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Terms & Conditions | Service Agreement | Integrity",
  description:
    "Read the Terms and Conditions for Integrity Clean Solutions cleaning services in Orlando, FL. Understand our service agreement, cancellation policy, payment terms, and customer responsibilities. Updated January 2025.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Integrity Clean Solutions",
    description:
      "Read the Terms and Conditions for Integrity Clean Solutions cleaning services. Understand our service agreement, cancellation policy, and payment terms.",
    type: "website",
    url: "https://integritycleansolutions.com/terms-and-conditions",
    siteName: "Integrity Clean Solutions",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | Integrity Clean Solutions",
    description:
      "Read the Terms and Conditions for Integrity Clean Solutions cleaning services. Understand our service agreement and policies.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
    return (
        <main>
            <TermsAndConditions/>
        </main>
    );
};
