
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { Metadata } from "next";
export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Privacy Policy | Data Protection | Integrity Clean",
  description:
    "Read the Privacy Policy for Integrity Clean Solutions in Orlando, FL. Learn how we collect, use, and protect your personal information. Understand your privacy rights, data security measures, and customer information handling. We are committed to protecting your privacy.",
  alternates: {
    canonical: "https://integritycleansolutions.com/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Integrity Clean Solutions",
    description:
      "Read the Privacy Policy for Integrity Clean Solutions. Learn how we collect, use, and protect your personal information. We are committed to protecting your privacy.",
    type: "website",
    url: "https://integritycleansolutions.com/privacy-policy",
    siteName: "Integrity Clean Solutions",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Integrity Clean Solutions",
    description:
      "Read the Privacy Policy for Integrity Clean Solutions. Learn how we protect your personal information and respect your privacy rights.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
    return (
        <main>
            <PrivacyPolicy/>
        </main>
    );
};
