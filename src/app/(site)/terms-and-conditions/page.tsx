import TermsAndConditions from "@/components/TermsAndConditions";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Terms & Conditions | Integrity Clean Solutions",
};

export default function Page() {
    return (
        <main>
            <TermsAndConditions/>
        </main>
    );
};
