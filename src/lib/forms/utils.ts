/**
 * Form utility functions - Scalable form state management
 *
 * These utilities provide consistent patterns for:
 * - Error state management
 * - Form validation
 * - Type-safe form handling
 */

import type { FormErrors, ValidationResult } from "./types";

/**
 * Create initial empty errors object
 * Use this for consistent error state initialization
 */
export const createEmptyErrors = (): FormErrors => ({});

/**
 * Clear specific field error
 * Useful for clearing errors on field change
 */
export const clearFieldError = (
  errors: FormErrors,
  fieldName: string
): FormErrors => {
  const newErrors = { ...errors };
  delete newErrors[fieldName];
  return newErrors;
};

/**
 * Set field error
 * Type-safe error setting
 */
export const setFieldError = (
  errors: FormErrors,
  fieldName: string,
  error: string
): FormErrors => {
  return { ...errors, [fieldName]: error };
};

/**
 * Merge errors (useful for combining validation results)
 */
export const mergeErrors = (...errorObjects: FormErrors[]): FormErrors => {
  return Object.assign({}, ...errorObjects);
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error field name (useful for focusing first error)
 */
export const getFirstErrorField = (errors: FormErrors): string | undefined => {
  return Object.keys(errors)[0];
};

/**
 * Create validation result
 */
export const createValidationResult = (
  isValid: boolean,
  errors: FormErrors = {}
): ValidationResult => {
  return { isValid, errors };
};
