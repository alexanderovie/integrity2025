import ExcepServices from "@/components/Home/ExcepServices";

const commercialItems = [
  {
    id: 1,
    title: "We build recurring commercial cleaning plans around your operating hours, staff flow, and facility priorities.",
  },
  {
    id: 2,
    title: "Our crews support offices, clinics, restaurants, and other high-traffic environments that need dependable presentation every day.",
  },
  {
    id: 3,
    title: "Sanitization and shared-surface routines help maintain healthier workspaces for teams, guests, and customers.",
  },
  {
    id: 4,
    title: "Flexible nightly and weekly scheduling keeps service consistent without disrupting business operations.",
  },
  {
    id: 5,
    title: "Clear quoting, responsive communication, and quality-focused follow-through make commercial service easier to manage.",
  },
];

export default function CommercialExcepServices() {
  return (
    <ExcepServices
      items={commercialItems}
      badgeLabel="Why Orlando businesses choose us"
      title="Commercial cleaning support built for reliability, presentation, and recurring service"
    />
  );
}
