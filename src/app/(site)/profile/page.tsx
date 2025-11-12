
import UserProfile from "@/components/Auth/UserProfile";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Profile | Gleamer",
};

export default function Page() {
    return (
        <main>
            <UserProfile/>
        </main>
    );
};
