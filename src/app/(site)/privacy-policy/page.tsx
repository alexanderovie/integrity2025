
import PrivacyPolicy from "@/components/PrivacyPolicy";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Privacy Policy | Integrity Clean Solutions",
};

export default function Page() {
    return (
        <main>
            <PrivacyPolicy/>
        </main>
    );
};
