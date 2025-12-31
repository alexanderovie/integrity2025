
import ServicesListing from "@/components/Services/ServicesListing";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Professional Cleaning Services Orlando | Integrity",
    description: "Professional cleaning services in Orlando, FL. Residential and commercial cleaning with eco-friendly products. Deep cleaning, move-in/move-out, and regular maintenance.",
    alternates: {
        canonical: "/services",
    },
};

export default function Page() {
    return (
        <main>
            <ServicesListing/>
        </main>
    );
};
