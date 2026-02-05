import type { Metadata } from "next";
import JoinOurTeamForm from "@/components/JoinOurTeam/JoinOurTeamForm";

export const metadata: Metadata = {
  metadataBase: new URL("https://integritycleansolutions.com"),
  title: "Join Our Team | Integrity Clean Solutions",
  description:
    "Apply to join the Integrity Clean Solutions team. We are hiring reliable, detail-oriented cleaning professionals in Orlando, FL.",
  alternates: {
    canonical: "/join-our-team",
  },
  openGraph: {
    title: "Join Our Team | Integrity Clean Solutions",
    description:
      "Apply to join the Integrity Clean Solutions team. We are hiring reliable, detail-oriented cleaning professionals in Orlando, FL.",
    type: "website",
    url: "https://integritycleansolutions.com/join-our-team",
    siteName: "Integrity Clean Solutions",
    images: [
      {
        url: "https://integritycleansolutions.com/images/home/banner/banner-pagina-web.png",
        alt: "Join the Integrity Clean Solutions team",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Our Team | Integrity Clean Solutions",
    description:
      "Apply to join the Integrity Clean Solutions team. We are hiring reliable, detail-oriented cleaning professionals in Orlando, FL.",
    images: ["https://integritycleansolutions.com/images/home/banner/banner-pagina-web.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function JoinOurTeamPage(): React.ReactElement {
  return (
    <main>
      <section>
        <div className="relative pt-24 lg:pt-32 bg-secondary bg-[url('/images/home/banner/banner-pagina-web.png')] bg-cover bg-no-repeat bg-center">
          <div className="container">
            <div className="py-16 lg:py-28 flex items-center justify-center">
              <div className="flex flex-col gap-3 items-center text-center max-w-4xl">
                <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4 text-white">
                  <p className="font-semibold text-white">Join our team</p>
                </div>
                <h1 className="text-white font-semibold text-3xl md:text-4xl">
                  Work With Integrity Clean Solutions
                </h1>
                <p className="text-white/80 text-lg">
                  We are hiring dependable, detail-oriented cleaning professionals in Orlando. Tell us about your
                  experience, availability, and the role you are interested in.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl">
              <JoinOurTeamForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
