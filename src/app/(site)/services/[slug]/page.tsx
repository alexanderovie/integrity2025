
import ServicesDetail from "@/components/Services/ServicesDetail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Detail | Integrity Clean Solutions",
};

export default function Details() {
  return (
    <>
        <ServicesDetail/>
    </>
  );
};

