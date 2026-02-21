import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Feedback & Suggestions | Integrity Clean Solutions",
  description:
    "Your feedback matters to us. Share your experience, suggestions, or concerns. We're committed to improving our services based on your input.",
  alternates: {
    canonical: "https://integritycleansolutions.com/feedback",
  },
  openGraph: {
    title: "Feedback & Suggestions | Integrity Clean Solutions",
    description:
      "Your feedback matters to us. Share your experience, suggestions, or concerns.",
    type: "website",
    url: "https://integritycleansolutions.com/feedback",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "https://integritycleansolutions.com/assets/cover.jpg",
        alt: "Integrity Clean Solutions",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedback & Suggestions | Integrity Clean Solutions",
    description:
      "Your feedback matters to us. Share your experience, suggestions, or concerns.",
    images: ["https://integritycleansolutions.com/assets/cover.jpg"],
  },
};

const feedbackTypes = [
  { value: "suggestion", label: "Suggestion" },
  { value: "experience", label: "Share Experience" },
  { value: "concern", label: "Concern / Issue" },
  { value: "compliment", label: "Compliment" },
  { value: "other", label: "Other" },
];

export default function FeedbackPage() {
  return (
    <main>
      <section className="relative pt-24 lg:pt-32 pb-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/home/banner/hero-bg.png"
            alt="Feedback - Integrity Clean Solutions"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="container relative z-10">
          <div className="py-16 lg:py-28">
            <div className="flex flex-col gap-3 items-center text-center max-w-[600px] mx-auto">
              <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                <p className="font-semibold text-white">Feedback</p>
              </div>
              <h1 className="text-white font-semibold text-3xl md:text-4xl">
                Your Feedback Matters
              </h1>
              <p className="text-white/80 text-lg">
                We value your input. Whether it&apos;s a suggestion, compliment, or concern,
                we&apos;re here to listen and improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-offwhite-warm dark:bg-dark-gray">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium dark:text-white">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Your name"
                    className="input-field"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium dark:text-white">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-sm font-medium dark:text-white">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="(800) 930-0532"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="type" className="text-sm font-medium dark:text-white">
                  Feedback Type
                </label>
                <select id="type" name="type" className="input-field" required>
                  <option value="">Select feedback type</option>
                  {feedbackTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="orderNumber" className="text-sm font-medium dark:text-white">
                  Order/Service Number (if applicable)
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  name="orderNumber"
                  placeholder="Order number"
                  className="input-field"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium dark:text-white">
                  Your Feedback
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder="Tell us about your experience, suggestion, or concern..."
                  className="input-field resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-fit bg-primary hover:bg-deep-blue transition-colors duration-300 py-3.5 px-8 rounded-md font-semibold text-white"
              >
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary dark:bg-black">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col gap-3 items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Call Us</h3>
              <p className="text-white/70">(800) 930-0532</p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Visit Us</h3>
              <p className="text-white/70">4700 Millenia Blvd, Orlando, FL 32839</p>
            </div>
            <div className="flex flex-col gap-3 items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg">Email Us</h3>
              <p className="text-white/70">info@integritycleansolutions.com</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
