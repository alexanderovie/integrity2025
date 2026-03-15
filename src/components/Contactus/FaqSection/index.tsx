type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Can I cancel or reschedule a cleaning appointment?",
    answer:
      "Yes. You can reschedule or cancel in advance by contacting our team. We recommend giving as much notice as possible so we can adjust your service window quickly.",
  },
  {
    question: "Do you provide your own cleaning supplies and equipment?",
    answer:
      "Yes. Our team arrives with professional products and tools needed for the scheduled service. If you prefer specific products, let us know before your appointment.",
  },
  {
    question: "How does pricing work for residential and commercial cleaning?",
    answer:
      "Pricing depends on property size, service type, condition, and frequency. We provide clear quotes before service so you know exactly what is included.",
  },
  {
    question: "Are your cleaners insured and trained?",
    answer:
      "Yes. Our cleaning professionals are trained, verified, and fully insured. We follow structured procedures and quality control standards on every visit.",
  },
  {
    question: "Do you offer recurring cleaning plans?",
    answer:
      "Absolutely. We offer weekly, bi-weekly, and custom recurring plans for homes, offices, and rental properties across Orlando and surrounding areas.",
  },
  {
    question: "Which areas do you serve around Orlando?",
    answer:
      "We serve Orlando and nearby service areas. If you are outside our core zone, contact us and we will confirm availability based on your location.",
  },
];

type FaqSectionProps = {
  items?: FaqItem[];
  badgeLabel?: string;
  title?: string;
  description?: string;
};

const FaqSection = ({
  items = FAQ_ITEMS,
  badgeLabel = "Frequently Asked Questions",
  title = "Frequently Asked Questions",
  description,
}: FaqSectionProps) => {
  return (
    <section>
      <div className="py-20 lg:py-24 bg-offwhite-warm dark:bg-secondary">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
            <div className="bg-primary w-fit rounded-full py-1 px-4 mx-auto">
              <p className="font-semibold text-white">{badgeLabel}</p>
            </div>
            <h2 className="mt-4 text-2xl md:text-3xl font-semibold dark:text-white">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-secondary/75 dark:text-white/70">{description}</p>
            ) : null}
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-6 md:gap-10">
              {items.map((item) => (
                <article
                  key={item.question}
                  className="rounded-md bg-white dark:bg-dark-gray border border-natural-gray/40 dark:border-natural-gray/20 p-6"
                >
                  <h3 className="text-lg font-semibold dark:text-white">{item.question}</h3>
                  <p className="mt-2 text-secondary/75 dark:text-white/70">{item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
