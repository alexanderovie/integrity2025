import type { Metadata } from "next";
import SuccessPageContent from "./SuccessPageContent";

export const metadata: Metadata = {
  title: "Payment Success | Integrity Clean Solutions",
  description: "Thank you for booking with Integrity Clean Solutions. Your payment has been received successfully.",
  alternates: {
    canonical: "/success",
  },
};

export default function SuccessPage(): React.ReactElement {
  return <SuccessPageContent />;
}
