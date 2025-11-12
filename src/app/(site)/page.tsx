import CleaningHighlight from "@/components/Home/CleaningHighlight";
import CustomerFeedback from "@/components/Home/CustomerFeedback";
import ExcepServices from "@/components/Home/ExcepServices";
import HeroSection from "@/components/Home/Hero";
import Ourwork from "@/components/Home/OurWork";
import Pricing from "@/components/Home/Pricing";
import Promobar from "@/components/Home/Promobar";
import ServiceOfferings from "@/components/Home/ServiceOfferings";
import UserImpact from "@/components/UserImpact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrity Clean Solutions | Orlando Cleaning Experts",
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <Promobar/>
      <ServiceOfferings/>
      <CleaningHighlight/>
      <ExcepServices/>
      <CustomerFeedback/>
      <Pricing/>
      <Ourwork/>
      <UserImpact/>
    </>
  );
}
