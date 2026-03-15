"use client";

import Logo from "@/components/Layout/Header/Logo";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "#services", label: "Services" },
  { href: "#reviews", label: "Reviews" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingHeader() {
  const pathname = usePathname();
  const basePath = pathname === "/commercial-cleaning-orlando" ? "" : "/commercial-cleaning-orlando";

  return (
    <header className="fixed top-0 z-50 w-full">
      <div className="hidden bg-secondary lg:block">
        <div className="container">
          <div className="flex justify-between py-2.5">
            <div className="flex gap-12">
              <span className="flex items-center text-sm font-semibold text-white/80">
                Commercial cleaning landing focused on quote conversion
              </span>
              <a href="/service-areas" className="flex items-center text-sm font-semibold text-white hover:opacity-80">
                Serving Orlando and nearby areas
              </a>
            </div>
            <div className="flex items-center gap-9">
              <a href="tel:+18009300532" className="text-sm font-semibold text-white hover:opacity-80">
                (800) 930-0532
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-5 shadow-xl dark:bg-secondary lg:py-4">
        <div className="container">
          <div className="flex justify-between gap-4">
            <div className="flex items-center gap-12 xl:gap-20 xxl:gap-40">
              <Logo />

              <nav className="hidden lg:flex">
                <ul className="flex gap-0 xl:gap-1">
                  {links.map((link) => (
                    <li key={link.href} className="group">
                      <Link
                        href={`${basePath}${link.href}`}
                        className="block rounded-md px-1.5 py-2 transition duration-300 hover:bg-primary xl:px-3 xxl:px-4"
                      >
                        <p className="text-[15px] font-semibold text-secondary group-hover:text-white dark:text-white xl:text-base">
                          {link.label}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-2 xl:gap-3">
              <Link
                href="tel:+18009300532"
                className="group hidden items-center gap-0.5 rounded-md px-2 py-2 transition duration-300 hover:bg-primary dark:hover:bg-white/25 md:flex xl:gap-2 xl:px-4"
              >
                <span className="relative flex items-center">
                  <Image
                    src="/images/header/phone-icon.svg"
                    alt="phone-icon"
                    width={24}
                    height={24}
                    className="dark:hidden transition-opacity duration-200 group-hover:opacity-0"
                  />
                  <Image
                    src="/images/header/phone-white-icon.svg"
                    alt="phone-icon"
                    width={24}
                    height={24}
                    className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:opacity-100"
                  />
                </span>
                <p className="hidden text-[15px] font-semibold text-secondary group-hover:text-white dark:text-white xl:block xl:text-base">
                  (800) 930-0532
                </p>
              </Link>

              <Link
                href="/quote"
                className="group flex items-center rounded-sm bg-primary px-3 py-2.5 transition-colors duration-300 hover:bg-deep-blue xl:px-4 xl:py-3"
              >
                <span className="text-sm font-bold text-white">Get a Free Quote</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
