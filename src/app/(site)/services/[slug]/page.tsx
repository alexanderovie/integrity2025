
import ServicesDetail from "@/components/Services/ServicesDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Services detail | Gleamer",
};

export default function Details() {
  return (
    <>
        <ServicesDetail/>
    </>
  );
};

