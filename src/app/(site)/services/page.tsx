
import ServicesListing from "@/components/Services/ServicesListing";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Services | Gleamer",
};

export default function Page() {
    return (
        <main>
            <ServicesListing/>
        </main>
    );
};
