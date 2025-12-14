import CookiePolicy from "@/components/CookiePolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Integrity Clean Solutions",
  alternates: {
    canonical: "/cookie-policy",
  },
};

export default function Page() {
  return (
    <main>
      <CookiePolicy />
    </main>
  );
}
