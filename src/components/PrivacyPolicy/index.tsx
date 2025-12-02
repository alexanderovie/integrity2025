import Link from "next/link"

const PrivacyPolicy = () => {
    return (
        <div className="relative pt-24 dark:bg-dark-gray">
            <div className="container">
                <div className="flex flex-col gap-10 py-32">
                    <div className="flex flex-col items-center gap-3">
                    <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
                        <p className="font-semibold text-white">Privacy Policy</p>
                        </div>
                        <h1 className="font-semibold text-3xl md:text-4xl text-center">Privacy Policy</h1>
                    </div>
                    <div className="bg-offwhite-warm dark:bg-secondary p-10 rounded-md space-y-10">
                        <section className="space-y-4">
                            <p className="text-secondary dark:text-white/80">
                                This Privacy Policy explains how <span className="font-semibold">Integrity Clean Solutions, LLC</span> ("<span className="font-semibold">Integrity</span>", "<span className="font-semibold">we</span>", "<span className="font-semibold">our</span>", or "<span className="font-semibold">us</span>") collects, uses, shares, and protects personal information when you visit our website, request a quote, schedule a cleaning, or otherwise interact with our residential and commercial cleaning services in Orlando, Florida.
                            </p>
                            <p className="text-secondary dark:text-white/80">
                                By using our Services, you consent to the practices described in this Policy. We comply with applicable U.S. federal and Florida state privacy laws, as well as international frameworks such as the <span className="font-semibold">General Data Protection Regulation (GDPR)</span> and the <span className="font-semibold">California Consumer Privacy Act (CCPA)</span>. This Policy was last updated on <span className="font-semibold">November 12, 2025</span>.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">1. Information We Collect</h3>
                            <ul className="space-y-3 text-secondary dark:text-white/80">
                                <li><span className="font-semibold">1.1 Information you provide.</span> Name, email, phone number, physical address, property details, service preferences, billing details handled via our payment processors, and any notes you share when submitting forms, emails, or calls.</li>
                                <li><span className="font-semibold">1.2 Information collected automatically.</span> IP address, device identifiers, browser type, pages viewed, timestamps, referring URLs, and interactions collected through cookies, pixels, and analytics tools.</li>
                                <li><span className="font-semibold">1.3 Information from third parties.</span> Lead platforms, referral partners, payment processors, review sites, or social media integrations when you interact with our profiles or ads.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">2. How We Use Your Information</h3>
                            <ul className="space-y-3 text-secondary dark:text-white/80">
                                <li>Provide, schedule, and manage cleaning services.</li>
                                <li>Process payments, send invoices, and deliver booking confirmations.</li>
                                <li>Respond to requests, questions, or customer support inquiries.</li>
                                <li>Send service updates, promotions, and satisfaction surveys (you may opt out at any time).</li>
                                <li>Improve our website, marketing campaigns, and service quality through analytics.</li>
                                <li>Meet legal obligations, enforce agreements, and protect Integrity, our technicians, and clients.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">3. How We Share Information</h3>
                            <p className="text-secondary dark:text-white/80">
                                We do <span className="font-semibold">not</span> sell personal information. We may share data with:
                            </p>
                            <ul className="space-y-3 text-secondary dark:text-white/80">
                                <li>Trusted service providers (dispatching, payment processing, CRM, email, analytics) who process data on our behalf under written agreements.</li>
                                <li>Cleaning technicians and subcontractors who require limited information to perform scheduled services.</li>
                                <li>Law enforcement or regulators when required by law, subpoena, or to protect legal rights.</li>
                                <li>In corporate transactions such as a merger, acquisition, or asset sale, provided the recipient agrees to honor this Policy.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">4. Cookies & Tracking Technologies</h3>
                            <p className="text-secondary dark:text-white/80">
                                We use cookies, pixels, and similar technologies to remember preferences, measure campaign performance, and understand how visitors use our site. You can manage cookies in your browser settings. Disabling certain cookies may impact site functionality.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">5. Data Retention</h3>
                            <p className="text-secondary dark:text-white/80">
                                We retain personal information for as long as necessary to provide services, comply with our legal obligations, resolve disputes, and enforce agreements. When information is no longer required, we securely delete or anonymize it.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">6. Security</h3>
                            <p className="text-secondary dark:text-white/80">
                                We implement administrative, technical, and physical safeguards designed to protect personal information. These include encrypted connections, role-based access, technician background checks, and secure disposal procedures. However, no data transmission over the internet can be guaranteed as 100% secure.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">7. Your Privacy Rights</h3>
                            <ul className="space-y-3 text-secondary dark:text-white/80">
                                <li><span className="font-semibold">GDPR (EEA/UK) Rights.</span> You may request access, correction, deletion, restriction, or portability of your personal data, or object to certain processing. You also have the right to lodge a complaint with your local supervisory authority.</li>
                                <li><span className="font-semibold">CCPA / CPRA (California) Rights.</span> California residents may request to know the categories and specific pieces of personal information we collect, request deletion, and opt out of any sale or sharing. We honor authorized agent requests when properly verified.</li>
                                <li><span className="font-semibold">Marketing Preferences.</span> To opt out of emails, click the unsubscribe link or contact us directly. You may also disable cookies or adjust ad tracking settings on your device.</li>
                            </ul>
                            <p className="text-secondary dark:text-white/80">
                                To exercise these rights, submit a request using the contact methods below. We will verify your identity and respond within the timelines required by applicable law.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">8. Children&apos;s Privacy</h3>
                            <p className="text-secondary dark:text-white/80">
                                Our Services are not directed to children under 13. We do not knowingly collect personal information from minors. If you believe a child has provided us information, please contact us so we can delete it.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">9. Links to Other Websites</h3>
                            <p className="text-secondary dark:text-white/80">
                                Our website may contain links to scheduling tools, payment gateways, or partner resources. Their privacy practices are governed by their own policies. We encourage you to review those statements before submitting information.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">10. Updates to This Policy</h3>
                            <p className="text-secondary dark:text-white/80">
                                We may update this Policy to reflect operational changes or legal requirements. We will post the revised version on this page and update the Effective Date. Material changes may be communicated via email or in-app notices.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h3 className="font-semibold text-lg">11. Contact Us</h3>
                            <p className="text-secondary dark:text-white/80">For privacy inquiries or to exercise your rights, contact us:</p>
                            <ul className="text-secondary dark:text-white/80">
                                <li>Integrity Clean Solutions, LLC</li>
                                <li>4700 Millenia Blvd, Orlando, FL 32839</li>
                                <li><a href="tel:+18009300532" className="text-primary underline">+1 (800) 930-0532</a></li>
                                <li><a href="mailto:privacy@integritycleansolutions.com" className="text-primary underline">privacy@integritycleansolutions.com</a></li>
                            </ul>
                            <p className="text-secondary dark:text-white/80">Effective Date: November 12, 2025</p>
                            <p className="text-secondary dark:text-white/80">
                                For more details about our service agreement, please review our{" "}
                                <Link href="/terms-and-conditions" className="text-primary underline">
                                    Terms &amp; Conditions
                                </Link>.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PrivacyPolicy
