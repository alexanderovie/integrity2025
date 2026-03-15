import Footer from "@/components/Layout/Footer";
import LandingHeader from "@/components/Layout/Header/LandingHeader";

type CommercialLandingLayoutProps = {
  children: React.ReactNode;
};

export default function CommercialLandingLayout({ children }: CommercialLandingLayoutProps) {
  return (
    <>
      <LandingHeader />
      <main>{children}</main>
      <Footer />
    </>
  );
}
