import NotFound from "@/components/NotFound";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | Integrity Clean Solutions",
  description:
    "The page you’re looking for is not available. Return to Integrity Clean Solutions to discover our residential and commercial cleaning services.",
};

export default function ErrorPage(): React.ReactElement {
  return <NotFound />;
}
