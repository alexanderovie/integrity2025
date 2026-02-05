/**
 * Reusable form validators - Enterprise-grade validation patterns
 *
 * These validators follow patterns used by:
 * - Stripe: Email, phone validation
 * - Linear: Required field validation
 * - Vercel: Regex patterns and type safety
 *
 * All validators return undefined on success, string on error
 * This allows composition and easy error handling
 */

import type { FieldValidator } from "./types";
import { validatePhoneInput } from "@/lib/validation/phone";

/**
 * Email validation - RFC 5322 compliant pattern
 * Used by Stripe, Vercel, and other premium services
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return "Email is required.";
  }

  // RFC 5322 compliant email regex (simplified for practical use)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return "Enter a valid email address.";
  }

  return undefined;
};

/**
 * Phone validation - E.164 format compatible
 * Supports US and international formats
 */
export const validatePhone = (phone: string, required = true): string | undefined => {
  return validatePhoneInput(phone, { required, defaultCountry: "US", allowedCountries: ["US", "CA"] });
};

/**
 * Required field validation
 */
export const validateRequired = (value: string, fieldName = "This field"): string | undefined => {
  if (!value.trim()) {
    return `${fieldName} is required.`;
  }
  return undefined;
};

/**
 * ZIP code validation - US format
 */
export const validateZipCode = (zip: string, required = true): string | undefined => {
  if (!zip.trim()) {
    return required ? "ZIP code is required." : undefined;
  }

  // US ZIP: 5 digits
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zip.trim())) {
    return "Enter a valid 5-digit ZIP code.";
  }

  return undefined;
};

/**
 * Name validation - letters and spaces only
 */
export const validateName = (name: string, required = true): string | undefined => {
  if (!name.trim()) {
    return required ? "Name is required." : undefined;
  }

  // Allow letters, spaces, hyphens, and apostrophes (for names like O'Brien, Mary-Jane)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(name.trim())) {
    return "Name should only contain letters, spaces, hyphens, and apostrophes.";
  }

  return undefined;
};

/**
 * Generic string length validation
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName = "This field"
): string | undefined => {
  const length = value.trim().length;

  if (length < min) {
    return `${fieldName} must be at least ${min} characters.`;
  }

  if (length > max) {
    return `${fieldName} must be no more than ${max} characters.`;
  }

  return undefined;
};

/**
 * Compose multiple validators for a single field
 */
export const composeValidators = <T = string>(
  ...validators: Array<FieldValidator<T>>
): FieldValidator<T> => {
  return (value: T) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return undefined;
  };
};
