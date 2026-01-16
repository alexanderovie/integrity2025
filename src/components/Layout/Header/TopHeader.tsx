"use client";
import Image from "next/image";
import ThemeToggler from "./ThemeToggle";
import { useState } from "react";
import ContactModal from "./ContactModal";

const TopHeader = () => {
    const [contactModalOpen, setContactModalOpen] = useState(false);

    return (
        <div className="bg-secondary">
            <div className="container">
                <div className="flex justify-between py-2.5">
                    <div className="flex gap-12">
                        <button
                            onClick={() => setContactModalOpen(true)}
                            className="flex gap-2 items-center hover:opacity-80"
                            aria-label="Quick contact"
                        >
                            <Image src={"/images/topheader/white-mail-icon.svg"} alt="mail-icon" width={24} height={24} />
                        </button>
                        <a href="https://www.google.com/maps/search/?api=1&query=2180+Central+Florida+Parkway,+Orlando,+FL+32837" className="flex gap-2 items-center hover:opacity-80">
                            <Image src={"/images/topheader/white-map-icon.svg"} alt="map-icon" width={24} height={24} />
                            <span className="text-white text-sm font-semibold">2180 Central Florida Parkway, Orlando, FL 32837</span>
                        </a>
                    </div>
                    <div className="flex items-center gap-9">
                        <a href="https://x.com/wrappixel" className="hover:opacity-80">
                            <Image src={"/images/topheader/white-twitter-icon.svg"} alt="twitter-icon" width={18} height={18} />
                        </a>
                        <a href="https://www.facebook.com/wrappixel/" className="hover:opacity-80">
                            <Image src={"/images/topheader/white-facebook-icon.svg"} alt="facebook-icon" width={12} height={12} />
                        </a>
                        <a href="https://www.instagram.com/wrappixel/" className="hover:opacity-80">
                            <Image src={"/images/topheader/white-insta-icon.svg"} alt="instagram-icon" width={18} height={18} />
                        </a>
                        <ThemeToggler />
                    </div>
                </div>
            </div>
            {contactModalOpen && (
                <ContactModal
                    isOpen={contactModalOpen}
                    closeModal={() => setContactModalOpen(false)}
                />
            )}
        </div>
    );
}

export default TopHeader;
