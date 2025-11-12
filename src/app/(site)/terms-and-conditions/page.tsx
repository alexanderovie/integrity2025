import TermsAndConditions from "@/components/TermsAndConditions";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Terms & Conditions | Integrity Clean Solutions",
    alternates: {
        canonical: "/terms-and-conditions",
    },
};

export default function Page() {
    return (
        <main>
            <TermsAndConditions/>
        </main>
    );
};
