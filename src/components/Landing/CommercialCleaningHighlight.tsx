import CleaningHighlight from "@/components/Home/CleaningHighlight";

const commercialItems = [
  {
    image: "/images/home/cleaninghighlight/cleaning-img-1.svg",
    title: "Nightly and recurring coverage",
    description: "Ideal for offices, front desks, breakrooms, restrooms, and business spaces that need dependable upkeep.",
  },
  {
    image: "/images/home/cleaninghighlight/cleaning-img-2.svg",
    title: "Offices, clinics, and client-facing spaces",
    description: "Built for small businesses, medical offices, retail teams, and professional facilities around Orlando.",
  },
  {
    image: "/images/home/cleaninghighlight/cleaning-img-3.svg",
    title: "Low-disruption scheduling",
    description: "After-hours, weekly, and custom service windows that fit business operations more cleanly.",
  },
  {
    image: "/images/home/cleaninghighlight/cleaning-img-4.svg",
    title: "Sanitization-minded routines",
    description: "High-touch surfaces, shared areas, and practical cleaning standards that support healthier workplaces.",
  },
];

export default function CommercialCleaningHighlight() {
  return (
    <CleaningHighlight
      badgeLabel="Commercial Cleaning Focus"
      title="Commercial cleaning built for Orlando teams that need consistency, presentation, and flexible scheduling"
      paragraphs={[
        "Integrity Clean Solutions supports Orlando businesses with reliable office cleaning, recurring janitorial service, and cleaning routines tailored to real workplace traffic.",
        "From small offices to medical spaces and high-touch business environments, we help teams maintain cleaner facilities with less disruption to daily operations.",
      ]}
      items={commercialItems}
      ctaHref="/quote"
      ctaLabel="Get a Commercial Quote"
      imageSrc="/images/services/commercial-office-cleaning-1.jpg"
      imageAlt="Commercial office cleaning service in Orlando"
    />
  );
}
