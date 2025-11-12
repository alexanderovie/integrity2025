
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Privacy-Policy | Gleamer",
};

export default function Page() {
    return (
        <main>
            <PrivacyPolicy/>
        </main>
    );
};
