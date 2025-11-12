"use client";

import StandaloneHeader from "@/components/Layout/Header/StandaloneHeader";

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

