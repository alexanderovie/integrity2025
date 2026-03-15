import ServiceOfferings from "@/components/Home/ServiceOfferings";

const commercialFeaturedSlugs = [
  "commercial-cleaning",
  "post-construction-cleaning",
  "deep-cleaning",
  "regular-cleaning",
  "airbnb-cleaning",
  "move-in-out-cleaning",
  "carpet-cleaning",
];

export default function CommercialServiceOfferings() {
  return (
    <ServiceOfferings
      featuredSlugs={commercialFeaturedSlugs}
      badgeLabel="Commercial cleaning priorities"
      title="Cleaning services Orlando businesses can adapt to recurring operations"
      description="Prioritized for commercial intent: office cleaning, recurring service support, post-construction cleanup, and flexible add-on cleaning for business environments across Orlando."
      ctaHref="/services/commercial-cleaning"
      ctaLabel="View commercial cleaning"
    />
  );
}
