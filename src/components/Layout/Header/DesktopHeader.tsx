"use client";
import Link from "next/link";
import Logo from "./Logo";
import MenuData from "./Menudata";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import MobileThemeToggler from "./MobileThemeToggler";
import BookServicesModal from "./BookServicesModal";
import ContactModal from "./ContactModal";
import clsx from "clsx";

const DesktopHeader = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "Plan Your Cleaning",
        submitLabel: "Get started today",
        showServiceOptions: true,
        showScheduleFields: false,
        initialServiceSlug: "",
    });
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [activeLink, setActiveLink] = useState("");
    const [user, setUser] = useState<{ user: { email?: string } } | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tooltipRef = useRef(null);
    const lastScrollYRef = useRef(0);
    const isHiddenRef = useRef(false);
    const [isMobileHeaderHidden, setIsMobileHeaderHidden] = useState(false);

    const updateHiddenState = (hidden: boolean) => {
        if (isHiddenRef.current !== hidden) {
            isHiddenRef.current = hidden;
            setIsMobileHeaderHidden(hidden);
        }
    };

    useEffect(() => {
        const getSession = async () => {
            // TODO: Implementar sesión con Neon/JWT
            setUser(null);
        };
        function handleClickOutside(event: MouseEvent) {
            const element = tooltipRef.current as HTMLElement | null;
            if (element && !element.contains(event.target as Node)) {
                setShowTooltip(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        getSession();
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [pathname]);

    useEffect(() => {
        const updateActiveLink = () => {
            const fullPath = window.location.hash
                ? `${pathname}${window.location.hash}`
                : pathname;
            setActiveLink(fullPath);
        };
        updateActiveLink();
    }, [pathname, searchParams, setActiveLink]);

    const toggleTooltip = () => {
        setShowTooltip((prev) => !prev);
    };

    const closeSidebar = () => setSidebarOpen(false);

    const handleNavClick = () => closeSidebar();

    const handleContactModalOpen = () => {
        closeSidebar();
        setContactModalOpen(true);
    };

    const handleBookModalOpen = () => {
        closeSidebar();
        setModalConfig({
            title: "Plan Your Cleaning",
            submitLabel: "Get started today",
            showServiceOptions: true,
            showScheduleFields: false,
            initialServiceSlug: "",
        });
        setModalOpen(true);
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }
        const handleOpenModal = (event: Event) => {
            const customEvent = event as CustomEvent<{
                mode?: string;
                serviceSlug?: string;
            }>;
            const isSiteVisit = customEvent.detail?.mode === "site-visit";
            setModalConfig({
                title: isSiteVisit ? "Plan Your Site Visit" : "Plan Your Cleaning",
                submitLabel: isSiteVisit ? "Request a Site Visit" : "Get started today",
                showServiceOptions: !isSiteVisit,
                showScheduleFields: isSiteVisit,
                initialServiceSlug: customEvent.detail?.serviceSlug || "",
            });
            setModalOpen(true);
        };
        window.addEventListener("open-book-services-modal", handleOpenModal);
        return () => window.removeEventListener("open-book-services-modal", handleOpenModal);
    }, []);

    // Patrón enterprise React 19: resetear sidebar en navigation usando efecto controlado
    // Best practice: cerrar sidebar cuando cambia la ruta (UX estándar)
    useEffect(() => {
        // Solo cerrar si está abierto - evitar renders innecesarios
        if (sidebarOpen) {
            // Usar función de actualización para evitar dependencia circular
            setSidebarOpen(() => false);
        }
        // pathname como única dependencia - patrón estándar enterprise
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        lastScrollYRef.current = window.scrollY;

        const handleScroll = () => {
            const isMobileViewport = window.innerWidth < 1024;
            const currentScroll = window.scrollY;

            if (!isMobileViewport) {
                if (isHiddenRef.current) {
                    updateHiddenState(false);
                }
                lastScrollYRef.current = currentScroll;
                return;
            }

            const delta = currentScroll - lastScrollYRef.current;
            const threshold = 12;

            if (currentScroll <= 0) {
                updateHiddenState(false);
            } else if (delta > threshold && currentScroll > 60) {
                updateHiddenState(true);
            } else if (delta < -threshold) {
                updateHiddenState(false);
            }

            lastScrollYRef.current = currentScroll;
        };

        const handleResize = () => {
            if (window.innerWidth >= 1024 && isHiddenRef.current) {
                updateHiddenState(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <>
            <div
                className={clsx(
                    "transition-transform duration-200 ease-out lg:translate-y-0",
                    isMobileHeaderHidden ? "-translate-y-full" : "translate-y-0"
                )}
            >
            <div className="py-5 lg:py-4 bg-white dark:bg-secondary shadow-xl">
                <div className="container">
                    <div className="flex justify-between">
                        <div className="flex items-center gap-12 xl:gap-20 xxl:gap-40">
                            <Logo />
                            <nav className="hidden lg:flex">
                                <ul className="flex gap-0 xl:gap-1">
                                    {MenuData.map((value, index) => {
                                        return (
                                            <li key={index} className="group">
                                                <Link href={value.path} className={`block px-1.5 xl:px-3 xxl:px-4 py-2 rounded-md ${activeLink === value.path ? "bg-primary" : ""} hover:bg-primary transition duration-300`}>
                                                    <p className={`text-[15px] xl:text-base font-semibold text-secondary dark:text-white ${activeLink === value.path ? "text-white" : ""} group-hover:text-white dark:group-hover:text-white`}>
                                                        {value.title}
                                                    </p>
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </nav>

                        </div>
                        <div className="hidden lg:flex items-center gap-2 xl:gap-3">
                            <Link href={"tel:+18009300532"} className="group flex items-center gap-0.5 xl:gap-2 px-2 xl:px-4 py-2 hover:bg-primary dark:hover:bg-white/25 rounded-md transition duration-300">
                                <span className="relative flex items-center">
                                    <Image
                                        src={"/images/header/phone-icon.svg"}
                                        alt="phone-icon"
                                        width={24}
                                        height={24}
                                        className="dark:hidden group-hover:opacity-0 transition-opacity duration-200"
                                    />
                                    <Image
                                        src={"/images/header/phone-white-icon.svg"}
                                        alt="phone-icon"
                                        width={24}
                                        height={24}
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:opacity-100"
                                    />
                                </span>
                                <p className="hidden xl:block text-[15px] xl:text-base font-semibold text-secondary group-hover:text-white dark:text-white">
                                    (800) 930-0532
                                </p>
                            </Link>
                            <div
                                onClick={() => setModalOpen(true)}
                                className="group flex items-center py-2.5 xl:py-3 px-3 xl:px-4 bg-secondary hover:bg-deep-blue dark:bg-white/25 rounded-sm cursor-pointer transition-colors duration-300"
                            >
                                <span className="text-sm text-white group-hover:text-white font-bold">Book a service</span>
                            </div>
                            {user?.user?.email ? (
                                <>
                                    <div className="relative group flex items-center justify-center">
                                        <Image src={"/images/avatar/avatar_1.jpg"} alt="avatar" width={42} height={42} className="rounded-full cursor-pointer" onClick={toggleTooltip} />
                                        <Link href={"/profile"}>
                                            <p onClick={() => { setShowTooltip(false) }} className={`absolute w-fit text-sm font-medium text-center z-10 transition-opacity duration-200 bg-primary dark:bg-middlegreen text-creamwhite hover:text-secondary py-2 px-4 min-w-28 rounded-md shadow-2xl top-full left-1/2 transform -translate-x-1/2 mt-3 ${showTooltip ? "visible opacity-100" : "invisible opacity-0"}`}>
                                                View Profile
                                            </p>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href="/quote"
                                    className="group bg-primary hover:bg-deep-blue flex items-center py-2.5 xl:py-3 px-3 xl:px-4 rounded-sm transition-colors duration-300"
                                >
                                    <span className="text-sm text-white font-bold">
                                        Get a Quote
                                    </span>
                                </Link>
                            )}

                        </div>

                        {/* ------------------------- Mobile sidebar button starts ------------------------- */}
                        <div className="flex lg:hidden gap-5">
                            <MobileThemeToggler />
                            {user?.user?.email &&
                                <div className="relative group flex items-center justify-center">
                                    <Image src={"/images/avatar/avatar_1.jpg"} alt="avatar" width={35} height={35} className="rounded-full cursor-pointer" onClick={toggleTooltip} />
                                    <Link href={"/profile"}>
                                        <p onClick={() => { setShowTooltip(false) }} className={`absolute w-fit text-sm font-medium text-center z-10 transition-opacity duration-200 bg-primary dark:bg-middlegreen text-creamwhite hover:text-secondary py-2 px-4 min-w-28 rounded-md shadow-2xl top-full left-1/2 transform -translate-x-1/2 mt-3 ${showTooltip ? "visible opacity-100" : "invisible opacity-0"}`}>
                                            View Profile
                                        </p>
                                    </Link>
                                </div>
                            }
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex lg:hidden items-center">
                                <Image src={"/images/icon/menu-icon.svg"} alt="menu-icon" width={28} height={28} className="cursor-pointer dark:hidden" />
                                <Image src={"/images/icon/dark-menu-icon.svg"} alt="menu-icon" width={28} height={28} className="cursor-pointer hidden dark:block" />
                            </button>
                        </div>

                        {/* sidebar markup moved below */}
                    </div>
                </div>
            </div>
            </div>
            {contactModalOpen && (
                <ContactModal
                    isOpen={contactModalOpen}
                    closeModal={() => setContactModalOpen(false)}
                />
            )}
            {modalOpen && (
                <BookServicesModal
                    isOpen={modalOpen}
                    closeModal={() => setModalOpen(false)}
                    title={modalConfig.title}
                    submitLabel={modalConfig.submitLabel}
                    showServiceOptions={modalConfig.showServiceOptions}
                    showScheduleFields={modalConfig.showScheduleFields}
                    initialServiceSlug={modalConfig.initialServiceSlug}
                />
            )}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[110] bg-black/50"
                        onClick={() => setSidebarOpen(false)}
                        role="presentation"
                    />
                    <div
                        className={`fixed top-0 right-0 h-full w-full max-w-xs transform transition-transform duration-400 z-[120] ${
                            sidebarOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                    >
                        <div className="absolute inset-0 bg-white/98 backdrop-blur-md dark:bg-secondary/95" />
                        <div className="relative h-full overflow-y-auto shadow-2xl shadow-black/20">
                            <div className="flex items-center justify-between p-4">
                                <h2 className="text-lg font-bold">Menu</h2>
                                <button onClick={() => setSidebarOpen(false)} aria-label="Close mobile menu" className="cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                        <path
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <ul className="flex flex-col">
                                    {MenuData.map((value, index) => (
                                        <li key={index} className="py-1.5">
                                            <Link href={value.path} onClick={handleNavClick}>
                                                <p className="font-semibold dark:text-white">{value.title}</p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href="/quote"
                                    onClick={handleNavClick}
                                    className="group bg-primary hover:bg-deep-blue mt-4 flex items-center py-2.5 px-3 rounded-sm transition-colors duration-300"
                                >
                                    <span className="text-sm text-white font-bold group-hover:text-white">Get a Quote</span>
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleBookModalOpen}
                                    className="group bg-secondary hover:bg-deep-blue mt-3 flex items-center justify-center py-2.5 px-3 rounded-sm transition-colors duration-300"
                                >
                                    <span className="text-sm text-white font-bold group-hover:text-white">Book a Service</span>
                                </button>
                                <div className="flex flex-col mt-5">
                                    <button
                                        onClick={handleContactModalOpen}
                                        className="flex items-center py-1.5 hover:opacity-80"
                                        aria-label="Quick contact"
                                    >
                                        <Image src={"/images/topheader/white-mail-icon.svg"} alt="mail-icon" width={24} height={24} />
                                    </button>
                                    <Link href="https://www.google.com/maps/search/?api=1&query=4700+Millenia+Blvd,+Orlando,+FL+32839" className="flex gap-2 items-center py-1.5" onClick={handleNavClick}>
                                        <Image src={"/images/topheader/map-icon.svg"} alt="map-icon" width={24} height={24} className="dark:hidden" />
                                        <Image src={"/images/topheader/white-map-icon.svg"} alt="map-icon" width={24} height={24} className="hidden dark:block" />
                                        <span className="text-secondary dark:text-white text-base font-semibold">4700 Millenia Blvd, Orlando, FL 32839</span>
                                    </Link>
                                </div>
                                <div className="flex items-center gap-10 mt-5">
                                    <Link href="https://www.facebook.com/people/Integrity-Clean-Solution/61576074382774/" onClick={handleNavClick}>
                                        <Image src={"/images/topheader/facebook-icon.svg"} alt="facebook-icon" width={16} height={16} className="dark:hidden" />
                                        <Image src={"/images/topheader/white-facebook-icon.svg"} alt="facebook-icon" width={13} height={13} className="hidden dark:block" />
                                    </Link>
                                    <Link href="https://www.instagram.com/integritycleansolution/" onClick={handleNavClick}>
                                        <Image src={"/images/topheader/instagram-icon.svg"} alt="instagram-icon" width={25} height={25} className="dark:hidden" />
                                        <Image src={"/images/topheader/white-insta-icon.svg"} alt="instagram-icon" width={25} height={25} className="hidden dark:block" />
                                    </Link>
                                    <Link href="https://www.tiktok.com/@integritycleansolution" onClick={handleNavClick}>
                                        <Image src={"/images/topheader/tiktok-icon.svg"} alt="tiktok-icon" width={18} height={18} className="dark:hidden" />
                                        <Image src={"/images/topheader/white-tiktok-icon.svg"} alt="tiktok-icon" width={18} height={18} className="hidden dark:block" />
                                    </Link>
                                    <Link href="https://www.youtube.com/@IntegrityCleanSolutions/" onClick={handleNavClick}>
                                        <Image src={"/images/topheader/youtube-icon.svg"} alt="youtube-icon" width={18} height={18} className="dark:hidden" />
                                        <Image src={"/images/topheader/white-youtube-icon.svg"} alt="youtube-icon" width={18} height={18} className="hidden dark:block" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

export default DesktopHeader;
