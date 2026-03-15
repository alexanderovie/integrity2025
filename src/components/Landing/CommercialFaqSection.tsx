import FaqSection from "@/components/Contactus/FaqSection";

const commercialFaqItems = [
  {
    question: "Do you offer office cleaning service for small businesses in Orlando?",
    answer:
      "Yes. We support small offices, shared workspaces, and growing teams with flexible recurring cleaning plans built around your hours, traffic, and facility needs.",
  },
  {
    question: "Can you provide nightly office cleaning service in the Orlando area?",
    answer:
      "Yes. We can arrange nightly office cleaning and recurring janitorial schedules so your team arrives to a polished, ready-to-work environment each day.",
  },
  {
    question: "Do you clean medical offices and sanitization-sensitive spaces?",
    answer:
      "Yes. We support medical offices and other high-touch environments with structured cleaning and sanitization routines focused on shared surfaces, waiting areas, and client-facing spaces.",
  },
  {
    question: "Can you service restaurants and daycare facilities?",
    answer:
      "Yes. We tailor cleaning plans for restaurants, daycare facilities, and other high-traffic businesses that need dependable recurring service and stronger sanitization priorities.",
  },
  {
    question: "How does pricing work for commercial cleaning?",
    answer:
      "Pricing depends on facility size, service frequency, traffic level, and scope. We provide clear quotes so your team understands exactly what is included before service starts.",
  },
  {
    question: "Which Orlando areas do you serve for commercial cleaning?",
    answer:
      "We serve Orlando and nearby commercial service areas. If your business is outside our core coverage zone, contact us and we will confirm availability for your location.",
  },
];

export default function CommercialFaqSection() {
  return (
    <FaqSection
      items={commercialFaqItems}
      badgeLabel="Commercial Cleaning FAQ"
      title="Questions Orlando businesses ask before booking"
      description="Answers tailored for office cleaning, sanitization support, and recurring janitorial service in commercial spaces."
    />
  );
}
