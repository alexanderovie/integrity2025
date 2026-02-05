import TermsAndConditions from "@/components/TermsAndConditions";
import { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Terms & Conditions | Integrity Clean Solutions",
  description:
    "Read the complete Terms and Conditions for Integrity Clean Solutions cleaning services in Orlando, FL. Updated January 2026. Includes service agreement, cancellation policy, payment terms, and customer responsibilities.",
  alternates: {
    canonical: "https://integritycleansolutions.com/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | Integrity Clean Solutions",
    description:
      "Complete Terms and Conditions for Integrity Clean Solutions cleaning services. Service agreement, policies, and customer responsibilities.",
    type: "website",
    url: "https://integritycleansolutions.com/terms-and-conditions",
    siteName: "Integrity Clean Solutions",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Terms & Conditions | Integrity Clean Solutions",
    description:
      "Terms and Conditions for cleaning services in Orlando, FL. Updated January 2026.",
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
