
import AboutusBanner from "@/components/Aboutus/AboutusBanner";
import OurCareer from "@/components/Aboutus/OurCareer";
import OurCustomers from "@/components/Aboutus/OurCustomers";
import OurImpact from "@/components/Aboutus/OurImpact";
import Quotes from "@/components/Aboutus/Quotes";
import WhoWeAre from "@/components/Aboutus/WhoWeAre";
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "About Us | Integrity Clean Solutions",
    alternates: {
        canonical: "/about-us",
    },
};

export default function Page() {
    return (
        <main>
            <AboutusBanner/>
            <WhoWeAre/>
            <OurCustomers/>
            <OurImpact/>
            <Quotes/>
            <OurCareer/>
        </main>
    );
};
