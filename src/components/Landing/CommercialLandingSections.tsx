import CustomerFeedbackModern from "@/components/Home/CustomerFeedbackModern";
import HeroSection from "@/components/Home/Hero";
import Ourwork from "@/components/Home/OurWork";
import Pricing from "@/components/Home/Pricing";
import UserImpact from "@/components/UserImpact";
import CommercialCleaningHighlight from "./CommercialCleaningHighlight";
import CommercialExcepServices from "./CommercialExcepServices";
import CommercialFaqSection from "./CommercialFaqSection";
import CommercialPromobar from "./CommercialPromobar";
import CommercialServiceOfferings from "./CommercialServiceOfferings";

export default function CommercialLandingSections() {
  return (
    <>
      <div id="top">
        <HeroSection />
      </div>
      <CommercialPromobar />
      <div id="services">
        <CommercialServiceOfferings />
      </div>
      <CommercialCleaningHighlight />
      <CommercialExcepServices />
      <div id="reviews">
        <CustomerFeedbackModern />
      </div>
      <Pricing />
      <Ourwork />
      <div id="faq">
        <CommercialFaqSection />
      </div>
      <UserImpact />
    </>
  );
}
