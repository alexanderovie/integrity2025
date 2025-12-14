import Link from "next/link"

const CookiePolicy = () => {
  return (
    <div className="relative pt-24 dark:bg-dark-gray">
      <div className="container">
        <div className="flex flex-col gap-10 py-32">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
              <p className="font-semibold text-white">Cookie Policy</p>
            </div>
            <h1 className="font-semibold text-3xl md:text-4xl text-center">Cookie Policy | Integrity Clean Solutions Orlando Florida</h1>
          </div>
          <div className="bg-offwhite-warm dark:bg-secondary p-10 rounded-md space-y-10">
            <section className="space-y-4">
              <p className="text-secondary dark:text-white/80">
                <span className="font-semibold">COOKIE POLICY</span><br />
                Integrity Clean Solutions LLC – Orlando, Florida<br />
                Last updated: June 2025
              </p>
              <p className="text-secondary dark:text-white/80">
                This site uses cookies to improve user experience, analyze traffic, and optimize site functionality.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">1. What Are Cookies?</h3>
              <p className="text-secondary dark:text-white/80">
                Small files stored on the user&apos;s device.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">2. Types of Cookies Used</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• <span className="font-semibold">Essential:</span> basic site functionality</li>
                <li>• <span className="font-semibold">Analytics:</span> Google Analytics, Meta Pixel</li>
                <li>• <span className="font-semibold">Functional:</span> remember user preferences</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">3. How We Use Cookies</h3>
              <ul className="space-y-3 text-secondary dark:text-white/80">
                <li>• Analyze traffic</li>
                <li>• Improve experience</li>
                <li>• Optimize internal campaigns</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">4. Cookie Control</h3>
              <p className="text-secondary dark:text-white/80">
                Users can disable them from their browser, although some functions may be affected.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">5. Third-Party Cookies</h3>
              <p className="text-secondary dark:text-white/80">
                Analytics, Pixel, and CRM may use anonymous cookies. We do not share personally identifiable information.
              </p>
            </section>

            <section className="space-y-4">
              <h3 className="font-semibold text-lg">6. Changes to This Policy</h3>
              <p className="text-secondary dark:text-white/80">
                Any updates will be published on the website.
              </p>
            </section>

            <section className="space-y-4 pt-4 border-t border-gray-300 dark:border-gray-600">
              <h3 className="font-semibold text-lg">7. Contact</h3>
              <p className="text-secondary dark:text-white/80">
                📧 <a href="mailto:info@integritycleansolutions.com" className="text-primary underline">info@integritycleansolutions.com</a>
              </p>
              <p className="text-secondary dark:text-white/80 mt-6">
                For more information, please review our{" "}
                <Link href="/privacy-policy" className="text-primary underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
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

export default CookiePolicy
