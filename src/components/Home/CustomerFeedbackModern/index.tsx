import Image from "next/image";

const testimonials = [
  {
    quote:
      "Integrity Clean Solutions keeps our office spotless and ready for clients every morning. Their team is reliable, fast, and very detail-oriented.",
    name: "Natalie Carter",
    role: "Operations Manager | Orlando",
    avatar: "/images/home/testimonial/testimonial-img-1.png",
  },
  {
    quote:
      "We hired them for recurring home cleaning and the consistency is excellent. Every visit feels organized, careful, and professional.",
    name: "Daniel Wright",
    role: "Homeowner | Winter Park",
    avatar: "/images/home/testimonial/testimonial-img-2.png",
  },
  {
    quote:
      "Our Airbnb turnovers are smoother now. Communication is quick, checklists are followed, and the property is always guest-ready on time.",
    name: "Sofia Martinez",
    role: "Property Host | Kissimmee",
    avatar: "/images/home/testimonial/testimonial-img-3.png",
  },
];

const stats = [
  { label: "Client satisfaction", value: "98%", note: "based on recurring reviews" },
  { label: "Homes and businesses", value: "1,500+", note: "cleaned across Greater Orlando" },
  { label: "On-time arrivals", value: "99%", note: "for scheduled cleanings" },
];

const CustomerFeedbackModern = () => {
  return (
    <section>
      <div className="relative overflow-hidden bg-secondary py-20 sm:py-28 dark:bg-black">
        <div className="absolute -left-16 top-12 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -right-20 bottom-8 h-72 w-72 rounded-full bg-light-olive/25 blur-3xl" />

        <div className="container relative z-10">
          <div className="mb-10 sm:mb-14 max-w-2xl">
            <div className="bg-gray w-fit rounded-full py-1 px-4">
              <p className="font-semibold text-white">What our clients say</p>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-white md:text-4xl">
              Feedback from satisfied customers.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="h-full rounded-xl border border-white/10 bg-white/95 shadow-soft-primary dark:bg-dark-gray">
                <div className="p-6">
                  <p className="text-base italic text-secondary/90 dark:text-white/80">&quot;{item.quote}&quot;</p>
                </div>
                <div className="flex items-center gap-3 rounded-b-xl bg-offwhite-warm px-6 py-4 dark:bg-secondary/70">
                  <Image src={item.avatar} alt={item.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-secondary dark:text-white">{item.name}</p>
                    <p className="text-xs text-secondary/70 dark:text-white/70">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-2 gap-8 xl:grid-cols-3">
            {stats.map((item) => (
              <div key={item.label}>
                <h3 className="text-lg font-semibold text-white">{item.label}</h3>
                <p className="mt-2 text-4xl font-bold text-primary sm:text-5xl">{item.value}</p>
                <p className="mt-1 text-sm text-white/70">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerFeedbackModern;
