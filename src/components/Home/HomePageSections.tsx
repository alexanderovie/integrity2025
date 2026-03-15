import CleaningHighlight from "@/components/Home/CleaningHighlight";
import CustomerFeedbackModern from "@/components/Home/CustomerFeedbackModern";
import ExcepServices from "@/components/Home/ExcepServices";
import HeroSection from "@/components/Home/Hero";
import Ourwork from "@/components/Home/OurWork";
import Pricing from "@/components/Home/Pricing";
import Promobar from "@/components/Home/Promobar";
import ServiceOfferings from "@/components/Home/ServiceOfferings";
import FaqSection from "@/components/Contactus/FaqSection";
import UserImpact from "@/components/UserImpact";

export default function HomePageSections() {
  return (
    <>
      <HeroSection />
      <Promobar />
      <ServiceOfferings />
      <CleaningHighlight />
      <ExcepServices />
      <CustomerFeedbackModern />
      <Pricing />
      <Ourwork />
      <FaqSection />
      <UserImpact />
    </>
  );
}
