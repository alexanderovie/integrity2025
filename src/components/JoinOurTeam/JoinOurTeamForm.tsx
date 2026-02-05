"use client";

import { useState } from "react";
import type { FormErrors } from "@/lib/forms/types";
import { validateEmail, validateName, validatePhone, validateRequired } from "@/lib/forms/validators";
import { clearFieldError, createEmptyErrors } from "@/lib/forms/utils";
import { normalizePhone } from "@/lib/validation/phone";

type JoinFormData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  availability: string;
  startDate: string;
  experienceYears: string;
  workAuthorization: string;
  transportation: string;
  references: string;
  summary: string;
};

const DEFAULT_FORM: JoinFormData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  role: "",
  availability: "",
  startDate: "",
  experienceYears: "",
  workAuthorization: "",
  transportation: "",
  references: "",
  summary: "",
};

const JoinOurTeamForm = (): React.ReactElement => {
  const [formData, setFormData] = useState<JoinFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const hasFieldErrors = Object.entries(errors).some(
    ([key, value]) => key !== "submit" && Boolean(value),
  );
  const getFieldClass = (field: string) =>
    `input-field ${errors[field] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let firstErrorField = "";

    const nameError = validateName(formData.name, true);
    if (nameError) {
      newErrors.name = nameError;
      if (!firstErrorField) firstErrorField = "name";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
      if (!firstErrorField) firstErrorField = "email";
    }

    const phoneError = validatePhone(formData.phone, true);
    if (phoneError) {
      newErrors.phone = phoneError;
      if (!firstErrorField) firstErrorField = "phone";
    }

    const cityError = validateRequired(formData.city, "City");
    if (cityError) {
      newErrors.city = cityError;
      if (!firstErrorField) firstErrorField = "city";
    }

    const roleError = validateRequired(formData.role, "Role");
    if (roleError) {
      newErrors.role = roleError;
      if (!firstErrorField) firstErrorField = "role";
    }

    const availabilityError = validateRequired(formData.availability, "Availability");
    if (availabilityError) {
      newErrors.availability = availabilityError;
      if (!firstErrorField) firstErrorField = "availability";
    }

    const workAuthError = validateRequired(formData.workAuthorization, "Work authorization");
    if (workAuthError) {
      newErrors.workAuthorization = workAuthError;
      if (!firstErrorField) firstErrorField = "workAuthorization";
    }

    const transportationError = validateRequired(formData.transportation, "Transportation");
    if (transportationError) {
      newErrors.transportation = transportationError;
      if (!firstErrorField) firstErrorField = "transportation";
    }

    const summaryError = validateRequired(formData.summary, "Summary");
    if (summaryError) {
      newErrors.summary = summaryError;
      if (!firstErrorField) firstErrorField = "summary";
    }

    setErrors(newErrors);
    if (firstErrorField && Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const element = document.querySelector(
          `[name="${firstErrorField}"]`,
        ) as HTMLElement | null;
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
        element?.focus();
      }, 100);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => clearFieldError(prev, name));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);
      setSubmitted(false);
      const phoneResult = normalizePhone(formData.phone, { required: true });
      const normalizedPhone = phoneResult.e164 || formData.phone;

      const response = await fetch("/api/join-our-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          phone: normalizedPhone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unable to submit your application.");
      }

      setFormData(DEFAULT_FORM);
      setSubmitted(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit your application.";
      setErrors((prev) => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16 sm:pb-20">
      <div className="p-1 sm:p-4 pb-28 bg-white dark:bg-dark-gray shadow-2xl rounded-md">
        <div className="w-full p-7 px-3 md:py-7 xl:py-11 md:px-8 xl:px-14">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6" aria-label="Join our team form">
            {hasFieldErrors && (
              <p className="text-red-600 text-sm" role="alert">
                Please fix the highlighted fields before submitting.
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="join-name" className="sr-only">Full name</label>
                <input
                  id="join-name"
                  type="text"
                  name="name"
                  placeholder="Full name *"
                  value={formData.name}
                  onChange={handleChange}
                  className={getFieldClass("name")}
                  autoComplete="name"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "join-name-error" : undefined}
                />
                {errors.name && (
                  <p id="join-name-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-email" className="sr-only">Email</label>
                <input
                  id="join-email"
                  type="email"
                  name="email"
                  placeholder="Email address *"
                  value={formData.email}
                  onChange={handleChange}
                  className={getFieldClass("email")}
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "join-email-error" : undefined}
                />
                {errors.email && (
                  <p id="join-email-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-phone" className="sr-only">Phone</label>
                <input
                  id="join-phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone number *"
                  value={formData.phone}
                  onChange={handleChange}
                  className={getFieldClass("phone")}
                  autoComplete="tel"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "join-phone-error" : undefined}
                />
                {errors.phone && (
                  <p id="join-phone-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-city" className="sr-only">City or ZIP</label>
                <input
                  id="join-city"
                  type="text"
                  name="city"
                  placeholder="City or ZIP *"
                  value={formData.city}
                  onChange={handleChange}
                  className={getFieldClass("city")}
                  autoComplete="address-level2"
                  required
                  aria-required="true"
                  aria-invalid={!!errors.city}
                  aria-describedby={errors.city ? "join-city-error" : undefined}
                />
                {errors.city && (
                  <p id="join-city-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.city}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-role" className="sr-only">Role of interest</label>
                <select
                  id="join-role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={getFieldClass("role")}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.role}
                  aria-describedby={errors.role ? "join-role-error" : undefined}
                >
                  <option value="">Role of interest *</option>
                  <option value="residential-cleaner">Residential Cleaner</option>
                  <option value="commercial-cleaner">Commercial Cleaner</option>
                  <option value="team-lead">Team Lead</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="office-support">Office Support</option>
                  <option value="other">Other</option>
                </select>
                {errors.role && (
                  <p id="join-role-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-availability" className="sr-only">Availability</label>
                <select
                  id="join-availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className={getFieldClass("availability")}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.availability}
                  aria-describedby={errors.availability ? "join-availability-error" : undefined}
                >
                  <option value="">Availability *</option>
                  <option value="weekday-am">Weekdays (AM)</option>
                  <option value="weekday-pm">Weekdays (PM)</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
                {errors.availability && (
                  <p id="join-availability-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.availability}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-start-date" className="sr-only">Start date</label>
                <input
                  id="join-start-date"
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={getFieldClass("startDate")}
                />
              </div>
              <div>
                <label htmlFor="join-experience" className="sr-only">Years of experience</label>
                <input
                  id="join-experience"
                  type="number"
                  name="experienceYears"
                  placeholder="Years of experience"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  className={getFieldClass("experienceYears")}
                  min={0}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label htmlFor="join-work-authorization" className="sr-only">Work authorization</label>
                <select
                  id="join-work-authorization"
                  name="workAuthorization"
                  value={formData.workAuthorization}
                  onChange={handleChange}
                  className={getFieldClass("workAuthorization")}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.workAuthorization}
                  aria-describedby={errors.workAuthorization ? "join-work-authorization-error" : undefined}
                >
                  <option value="">Work authorization in the U.S. *</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.workAuthorization && (
                  <p id="join-work-authorization-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.workAuthorization}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="join-transportation" className="sr-only">Transportation</label>
                <select
                  id="join-transportation"
                  name="transportation"
                  value={formData.transportation}
                  onChange={handleChange}
                  className={getFieldClass("transportation")}
                  required
                  aria-required="true"
                  aria-invalid={!!errors.transportation}
                  aria-describedby={errors.transportation ? "join-transportation-error" : undefined}
                >
                  <option value="">Reliable transportation? *</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.transportation && (
                  <p id="join-transportation-error" className="text-red-600 text-sm mt-1" role="alert">
                    {errors.transportation}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="join-references" className="sr-only">References</label>
              <textarea
                id="join-references"
                name="references"
                placeholder="References (name and contact info)"
                value={formData.references}
                onChange={handleChange}
                className={getFieldClass("references")}
                rows={3}
              />
            </div>
            <div>
              <label htmlFor="join-summary" className="sr-only">Summary</label>
              <textarea
                id="join-summary"
                name="summary"
                placeholder="Tell us about your experience and why you want to join *"
                value={formData.summary}
                onChange={handleChange}
                className={getFieldClass("summary")}
                rows={5}
                required
                aria-required="true"
                aria-invalid={!!errors.summary}
                aria-describedby={errors.summary ? "join-summary-error" : undefined}
              />
              {errors.summary && (
                <p id="join-summary-error" className="text-red-600 text-sm mt-1" role="alert">
                  {errors.summary}
                </p>
              )}
            </div>
            {errors.submit && (
              <p className="text-red-600 text-sm" role="alert">
                {errors.submit}
              </p>
            )}
            {submitted && (
              <p className="text-primary text-sm" role="status">
                Application submitted. We will contact you soon.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="group w-fit flex items-center py-3 px-6 bg-secondary hover:bg-deep-blue transition-colors duration-300 rounded-sm cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="text-base text-white font-bold">{loading ? "Sending..." : "Submit application"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinOurTeamForm;
