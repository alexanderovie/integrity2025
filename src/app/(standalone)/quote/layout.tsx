import StandaloneHeader from "@/components/Layout/Header/StandaloneHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Services Quote | Integrity Clean Solutions",
  description:
    "Customize your residential or commercial cleaning plan, choose extras, and schedule preferred dates with Integrity Clean Solutions in Orlando.",
};

type QuoteLayoutProps = {
  children: React.ReactNode;
};

export default function QuoteLayout({ children }: QuoteLayoutProps) {
  return (
    <>
      <StandaloneHeader />
      {children}
    </>
  );
}

