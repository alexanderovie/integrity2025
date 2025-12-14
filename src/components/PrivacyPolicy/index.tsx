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
            <h1 className="font-semibold text-3xl md:text-4xl text-center">Privacy Policy | Integrity Clean Solutions Orlando Florida</h1>
          </div>
          <div className="bg-offwhite-warm dark:bg-secondary p-10 rounded-md space-y-10">
            <section className="space-y-4">
              <p className="text-secondary dark:text-white/80">
                <span className="font-semibold">PRIVACY POLICY</span><br />
                Integrity Clean Solutions LLC – Orlando, Florida<br />
                Last updated: June 2025
              </p>
              <p className="text-secondary dark:text-white/80">
                At Integrity Clean Solutions LLC (&quot;<span className="font-semibold">the Company</span>&quot;, &quot;<span className="font-semibold">we</span>&quot;), we respect and protect the privacy of all users and clients who visit our website, make a booking, or communicate with us. This Policy explains what information we collect, how we use it, how we protect it, and what your rights are.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">1. Information We Collect</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• <span className="font-semibold">Voluntary information:</span> name, address, phone, email, type of service, preferences.</li>
                <li>• <span className="font-semibold">Automatic information:</span> cookies, IP, browsing data.</li>
                <li>• <span className="font-semibold">Third-party information:</span> Stripe, Google Analytics, Meta Pixel, CRM.</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">2. Use of Information</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• Process bookings and quotes</li>
                <li>• Confirmations and reminders</li>
                <li>• Improve site performance</li>
                <li>• Ensure service operation</li>
              </ul>
              <p className="text-secondary dark:text-white/80 font-semibold">We never sell or rent data.</p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">3. Data Protection</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• SSL encryption</li>
                <li>• Restricted access</li>
                <li>• We do not store card data (Stripe handles it)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">4. When We Share Data</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• <span className="font-semibold">Stripe</span> (payments)</li>
                <li>• <span className="font-semibold">Analytics and Pixel</span> (statistics)</li>
                <li>• <span className="font-semibold">CRM</span> (internal management)</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">5. User Rights</h3>
              <p className="text-secondary dark:text-white/80">
                Access, correction, deletion, and unsubscribe.<br />
                Contact: <a href="mailto:info@integritycleansolutions.com" className="text-primary underline">info@integritycleansolutions.com</a>
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">6. Data Retention</h3>
              <p className="text-secondary dark:text-white/80">
                Data is retained as long as necessary for legal and operational obligations.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">7. External Links</h3>
              <p className="text-secondary dark:text-white/80">We are not responsible for their privacy policies.</p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">8. Changes to This Policy</h3>
              <p className="text-secondary dark:text-white/80">The current version will always be the one published on the website.</p>
            </section>

            <section className="space-y-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <h3 className="font-semibold text-lg">9. Contact</h3>
              <ul className="text-secondary dark:text-white/80 space-y-2">
                <li>Integrity Clean Solutions LLC</li>
                <li>Orlando, Florida</li>
                <li>📧 <a href="mailto:info@integritycleansolutions.com" className="text-primary underline">info@integritycleansolutions.com</a></li>
                <li>📞 <a href="tel:+18009300532" className="text-primary underline">(800) 930-0532</a></li>
              </ul>
              <p className="text-secondary dark:text-white/80 mt-6">
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
