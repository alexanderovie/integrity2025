
const TermsAndConditions = () => {
  return (
    <section>
      <div className="relative pt-24 dark:bg-dark-gray">
        <div className="container">
          <div className="flex flex-col gap-10 py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-primary w-fit flex-1 rounded-full py-1 px-4">
                <p className="font-semibold text-white">Terms & Conditions</p>
              </div>
              <h1 className="font-semibold text-3xl md:text-4xl text-center">Terms &amp; Conditions</h1>
            </div>

            <div className="bg-offwhite-warm dark:bg-secondary p-10 rounded-md space-y-10">
              <section className="space-y-4">
                <p className="text-secondary dark:text-white/80">
                  <span className="font-semibold">TERMS AND CONDITIONS OF SERVICE</span><br />
                  INTEGRITY CLEAN SOLUTIONS LLC – ORLANDO, FLORIDA<br />
                  Version 1.0 – Updated: January 2025
                </p>
                <p className="text-secondary dark:text-white/80">
                  By booking or contracting any of the services offered by Integrity Clean Solutions LLC (&quot;<span className="font-semibold">the Company</span>&quot;), you (&quot;<span className="font-semibold">the Client</span>&quot;) agree to comply with these Terms and Conditions. If you do not agree, do not proceed with the booking.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">1. ACCEPTANCE OF TERMS</h3>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>Contracting the service, whether through website, phone, message, form, or advance payment, constitutes full acceptance of this document.</li>
                  <li>These terms apply to all services provided within Orlando and surrounding areas of Orange, Osceola, and Seminole Counties.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">2. DEFINITION OF SERVICES</h3>
                <p className="text-secondary dark:text-white/80">Integrity Clean Solutions LLC offers professional cleaning services:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li><span className="font-semibold">2.1 Residential Cleaning</span>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Standard Cleaning</li>
                      <li>• Deep Cleaning</li>
                      <li>• Move In / Move Out Cleaning</li>
                      <li>• Carpet Cleaning</li>
                    </ul>
                  </li>
                  <li><span className="font-semibold">2.2 Commercial Services</span>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Offices</li>
                      <li>• Commercial spaces</li>
                      <li>• Professional buildings and spaces</li>
                    </ul>
                    <p className="ml-6 mt-2 italic">Note: Commercial services require a mandatory technical visit prior to quotation.</p>
                  </li>
                  <li><span className="font-semibold">2.3 Additional Services (Extras)</span>
                    <p className="ml-6 mt-2">Available for an additional charge:</p>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Interior window cleaning</li>
                      <li>• Detailed blind cleaning</li>
                      <li>• Detailed baseboard cleaning</li>
                      <li>• Inside oven</li>
                      <li>• Inside fridge</li>
                      <li>• Inside kitchen cabinets</li>
                      <li>• Outdoor furniture cleaning</li>
                      <li>• Garage / patio / balconies</li>
                      <li>• Pet hair removal</li>
                      <li>• Heavy Duty Cleaning</li>
                      <li>• Carpet Cleaning</li>
                      <li>• Other tasks specified at the time of booking</li>
                    </ul>
                    <p className="ml-6 mt-2 font-semibold">These extras are NOT included in standard cleaning.</p>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">3. BOOKINGS AND DEPOSITS</h3>
                <p className="text-secondary dark:text-white/80">Booking online or by phone does not automatically guarantee the selected time; the appointment is confirmed only when the Company notifies you by message, email, or call.</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li><span className="font-semibold">3.1 Required Deposits</span>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Standard Cleaning: non-refundable deposit of $70 USD.</li>
                      <li>• Deep Cleaning or Move In/Out: non-refundable deposit of 50% of total value.</li>
                    </ul>
                  </li>
                  <li><span className="font-semibold">3.2 Pre-payment Policy</span>
                    <p className="ml-6 mt-2">Full payment must be made before service begins, via:</p>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Stripe (credit or debit card)</li>
                      <li>• Zelle info@integritycleansolutions.com</li>
                      <li>• Cash (only with prior confirmation)</li>
                    </ul>
                    <p className="ml-6 mt-2">The company may place a temporary hold on the card 24 hours before service.</p>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">4. TIME SLOTS AND TEAM ARRIVAL</h3>
                <p className="text-secondary dark:text-white/80">Integrity Clean Solutions LLC operates in time slots, not exact times:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• <span className="font-semibold">AM Slot:</span> 8:00 am – 12:00 pm</li>
                  <li>• <span className="font-semibold">PM Slot:</span> 1:00 pm – 5:00 pm</li>
                </ul>
                <p className="text-secondary dark:text-white/80">This ensures punctuality and protects the client from delays between one service and another.</p>
                <p className="text-secondary dark:text-white/80">The company will notify of any reasonable delay due to traffic or operational conditions.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">5. CANCELLATIONS AND RESCHEDULING</h3>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li><span className="font-semibold">5.1 Cancellation with less than 24 hours</span>
                    <p className="ml-6 mt-2">A cancellation fee equivalent to the deposit will apply:</p>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• $70 for standard cleanings</li>
                      <li>• 50% of value for deep cleaning/move in-out</li>
                    </ul>
                  </li>
                  <li><span className="font-semibold">5.2 Rescheduling</span>
                    <p className="ml-6 mt-2">The client may reschedule up to 4 times as long as notice is given 24 hours in advance.</p>
                    <p className="ml-6 mt-2">After the limit, the deposit is forfeited.</p>
                  </li>
                  <li><span className="font-semibold">5.3 Same-day Cancellations</span>
                    <p className="ml-6 mt-2">100% of the deposit will be charged as an operational interruption fee.</p>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">6. PROPERTY ACCESS AND LOCKOUTS</h3>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>The client must ensure secure access to the property.</li>
                  <li>If the cleaning team cannot enter and receives no response within 15 minutes, the appointment will be considered canceled and a $70 USD fee will apply.</li>
                  <li>If there is an alarm system, the client must provide correct instructions. If the code is incorrect and causes delay or lockout, the lockout fee will apply.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">7. PARKING</h3>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>It is the client&apos;s responsibility to provide nearby and accessible parking.</li>
                  <li>If there is no free parking available:
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Parking costs will be charged to the client.</li>
                      <li>• If there is no safe place to park, the appointment will be considered canceled and the corresponding $70 fee will apply.</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">8. CLEANING PERSONNEL AND SECURITY</h3>
                <p className="text-secondary dark:text-white/80">Integrity Clean Solutions LLC operates with crews of 2–3 technicians, all with:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Background verification</li>
                  <li>• Training in professional protocols</li>
                  <li>• Continuous supervision</li>
                  <li><span className="font-semibold">Employees and contractors cannot:</span>
                    <ul className="ml-6 mt-2 space-y-2">
                      <li>• Smoke inside the property</li>
                      <li>• Handle weapons</li>
                      <li>• Transport client valuables</li>
                      <li>• Receive direct orders contradicting security protocols</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">9. RIGHT TO REFUSE OR WITHDRAW SERVICE</h3>
                <p className="text-secondary dark:text-white/80">The company may withdraw or cancel without refund if it encounters:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Unsafe conditions</li>
                  <li>• Visible loaded or unsecured weapons</li>
                  <li>• Aggressive pets</li>
                  <li>• Extreme unsanitary situations</li>
                  <li>• Severe hoarding</li>
                  <li>• Hostile or inappropriate conduct</li>
                </ul>
                <p className="text-secondary dark:text-white/80">In these cases, the cancellation fee will apply.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">10. PET POLICY</h3>
                <p className="text-secondary dark:text-white/80">Pets must remain in a separate area during cleaning.</p>
                <p className="text-secondary dark:text-white/80">If they pose a risk or prevent work, the team may withdraw and apply the cancellation fee.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">11. HOME PREPARATION</h3>
                <p className="text-secondary dark:text-white/80">The client must:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Keep main surfaces free of objects</li>
                  <li>• Pick up personal items</li>
                  <li>• Declare delicate or fragile areas</li>
                  <li>• Inform if dish cleaning, inside cabinets, or other additional tasks are desired</li>
                </ul>
                <p className="text-secondary dark:text-white/80">If the home is in excessively cluttered conditions, an additional fee may apply or the service may be canceled.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">12. PROHIBITED SERVICES</h3>
                <p className="text-secondary dark:text-white/80">For safety reasons, technicians CANNOT:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Treat severe mold (requires certified company)</li>
                  <li>• Clean bodily fluids or waste</li>
                  <li>• Handle biohazard cases</li>
                  <li>• Handle extreme hoarding</li>
                  <li>• Move objects weighing more than 35 lbs</li>
                  <li>• Use ladders higher than one step</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">13. RATE AND TIME ADJUSTMENTS</h3>
                <p className="text-secondary dark:text-white/80">Prices are based on standard conditions.</p>
                <p className="text-secondary dark:text-white/80">The company may adjust rates if:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• There is excessive dirt or abnormal accumulation</li>
                  <li>• There are more occupants than reported</li>
                  <li>• The house has more rooms or areas than declared</li>
                  <li>• Additional work not mentioned is required</li>
                </ul>
                <p className="text-secondary dark:text-white/80">If the client does not authorize the adjustment, the team may withdraw and the cancellation fee will apply.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">14. PAYMENTS</h3>
                <p className="text-secondary dark:text-white/80">Payments may be made via:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Stripe</li>
                  <li>• Credit/debit card</li>
                  <li>• Zelle info@integritycleansolutions.com</li>
                  <li>• Cash (with prior notice)</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Payment must be completed on the same day.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">15. REFUND POLICY</h3>
                <p className="text-secondary dark:text-white/80">All payments are final and non-refundable.</p>
                <p className="text-secondary dark:text-white/80">However, Integrity Clean Solutions LLC offers a correction guarantee:</p>
                <p className="text-secondary dark:text-white/80">If something was not satisfactory, the client may notify within 24 hours after service, and the team will return at no cost.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">16. BREAKAGES, DAMAGES AND LOSSES</h3>
                <p className="text-secondary dark:text-white/80">The company has general liability insurance.</p>
                <p className="text-secondary dark:text-white/80">It does not cover damages from:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Undeclared fragile items</li>
                  <li>• Unstable or poorly installed objects</li>
                  <li>• Normal wear and tear</li>
                  <li>• Client equipment requested for technician use</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Any claim must be made within 24 hours with before and after photographs.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">17. NO SOLICITATION OF EMPLOYEES</h3>
                <p className="text-secondary dark:text-white/80">The client agrees not to directly hire any employee or technician of Integrity Clean Solutions LLC for a period of 12 months, except through written agreement.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">18. HOLIDAYS AND SEVERE WEATHER</h3>
                <p className="text-secondary dark:text-white/80">No service is provided on:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Independence Day</li>
                  <li>• Thanksgiving</li>
                  <li>• Black Friday</li>
                  <li>• Christmas Eve</li>
                  <li>• Christmas</li>
                  <li>• New Year&apos;s Eve</li>
                  <li>• New Year&apos;s Day</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Cancellation without penalty is allowed for hurricane or tropical storm alerts according to Florida authorities.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">19. DISTANCE AND URGENT BOOKING FEES</h3>
                <p className="text-secondary dark:text-white/80">Additional fees may apply if:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• The client is outside the standard service area</li>
                  <li>• Same-day cleaning is requested</li>
                  <li>• Priority attention is required</li>
                  <li>• Extended hours are needed</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">20. LIMITATION OF LIABILITY</h3>
                <p className="text-secondary dark:text-white/80">The company is not responsible for:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Indirect damages</li>
                  <li>• Economic losses</li>
                  <li>• Damages to undeclared items</li>
                  <li>• Preexisting conditions</li>
                  <li>• Utility failures or pests</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Maximum liability: the value paid for the contracted service.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">21. PHOTOGRAPHIC EVIDENCE</h3>
                <p className="text-secondary dark:text-white/80">The client authorizes the taking of &quot;before and after&quot; photographs for:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Warranty</li>
                  <li>• Claims</li>
                  <li>• Quality control</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Photos will not include personal documents or sensitive information.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">22. WAIVER OF TIME DISPUTES</h3>
                <p className="text-secondary dark:text-white/80">Since the company charges per service, the client waives:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Complaints about duration</li>
                  <li>• Disputes about &quot;time invested&quot;</li>
                </ul>
                <p className="text-secondary dark:text-white/80">What matters is the completion of the work, not the time.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">23. CLIENT CONDUCT</h3>
                <p className="text-secondary dark:text-white/80">The client must maintain:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Respect</li>
                  <li>• Appropriate language</li>
                  <li>• No harassment</li>
                  <li>• No intimidation</li>
                  <li>• No offensive comments</li>
                </ul>
                <p className="text-secondary dark:text-white/80">If not complied with, the company will withdraw service without refund.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">24. ILLEGAL ACTIVITIES / DIRECT RISK</h3>
                <p className="text-secondary dark:text-white/80">Personnel cannot work if observed:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Drugs</li>
                  <li>• Unsecured weapons</li>
                  <li>• Violence</li>
                  <li>• Structural risks</li>
                </ul>
                <p className="text-secondary dark:text-white/80">Cancellation fee will apply.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">25. AUTHORIZATION FOR ENTRY WITHOUT CLIENT PRESENCE</h3>
                <p className="text-secondary dark:text-white/80">When the client is not present:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Assumes responsibility for unsecured fragile objects</li>
                  <li>• Authorizes internal photos</li>
                  <li>• Authorizes re-entry in case of corrections</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">26. REPUTATION PROTECTION (DEFAMATION)</h3>
                <p className="text-secondary dark:text-white/80">The client agrees not to publish false, malicious, or extortionate reviews.</p>
                <p className="text-secondary dark:text-white/80">The company may initiate legal actions in accordance with Florida defamation laws.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">27. UNCOVERED RISKS</h3>
                <p className="text-secondary dark:text-white/80">The company does NOT cover:</p>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>• Corrosive substances</li>
                  <li>• Pests</li>
                  <li>• Excessive humidity</li>
                  <li>• Out-of-control mold</li>
                  <li>• Material degradation over time</li>
                  <li>• Appliances damaged by age</li>
                  <li>• Accidents caused by pets</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">28. PHOTO, VIDEO AND RECORDING POLICY</h3>
                <ul className="space-y-3 text-secondary dark:text-white/80">
                  <li>The client cannot record personnel without consent.</li>
                  <li>The company may record calls for operational purposes.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">29. INTELLECTUAL PROPERTY AND MATERIALS</h3>
                <p className="text-secondary dark:text-white/80">All material created by the company (catalogs, photos, reports) is property of Integrity Clean Solutions LLC.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">30. APPLICABLE LAW AND JURISDICTION</h3>
                <p className="text-secondary dark:text-white/80">These terms are governed by the laws of the State of Florida.</p>
                <p className="text-secondary dark:text-white/80">Any dispute will be resolved in the courts of Orange County, Florida.</p>
              </section>

              <section className="space-y-4">
                <h3 className="font-semibold text-lg">31. MODIFICATION OF TERMS</h3>
                <p className="text-secondary dark:text-white/80">Integrity Clean Solutions LLC may update these Terms at any time.</p>
                <p className="text-secondary dark:text-white/80">The current version will always be the one published on the website or sent to the client.</p>
              </section>

              <section className="space-y-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <p className="text-secondary dark:text-white/80 font-semibold">Version 1.0 – Updated January 2025</p>
                <p className="text-secondary dark:text-white/80 font-semibold">Integrity Clean Solutions LLC – Orlando, Florida</p>
                <div className="mt-6 space-y-2">
                  <p className="text-secondary dark:text-white/80 font-semibold">Contact Us:</p>
                  <ul className="text-secondary dark:text-white/80 space-y-1">
                    <li>Integrity Clean Solutions, LLC</li>
                    <li>Orlando, Florida</li>
                    <li><a href="mailto:info@integritycleansolutions.com" className="text-primary underline">info@integritycleansolutions.com</a></li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermsAndConditions
