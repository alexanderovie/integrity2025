import CleaningHighlight from "@/components/Home/CleaningHighlight";
import CustomerFeedbackModern from "@/components/Home/CustomerFeedbackModern";
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
  description:
    "Orlando's trusted cleaning experts. Eco-friendly residential & commercial cleaning services. Deep clean, move-in/out, Airbnb & regular maintenance. Free quotes!",
  alternates: {
    canonical: "https://integritycleansolutions.com/",
  },
  openGraph: {
    title: "Integrity Clean Solutions | Orlando Cleaning Experts",
    description:
      "Professional cleaning services in Orlando, FL. Residential and commercial cleaning with eco-friendly products. Deep cleaning, move-in/move-out, and regular maintenance.",
    type: "website",
    url: "https://integritycleansolutions.com/",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "https://integritycleansolutions.com/assets/cover.jpg",
        alt: "Integrity Clean Solutions - Professional Cleaning Services in Orlando",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrity Clean Solutions | Orlando Cleaning Experts",
    description:
      "Professional cleaning services in Orlando, FL. Residential and commercial cleaning with eco-friendly products. Get your free quote today!",
    images: ["https://integritycleansolutions.com/assets/cover.jpg"],
  },
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <Promobar/>
      <ServiceOfferings/>
      <CleaningHighlight/>
      <ExcepServices/>
      <CustomerFeedbackModern/>
      <Pricing/>
      <Ourwork/>
      <UserImpact/>
    </>
  );
}
