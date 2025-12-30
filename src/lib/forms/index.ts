/**
 * Form utilities and types - Enterprise-grade form handling
 *
 * This module provides scalable form patterns used by premium companies:
 * - Stripe: Type-safe error handling with Record<string, string>
 * - Linear: Reusable validators and composition patterns
 * - Vercel: Consistent form state management
 *
 * All forms should use these utilities for consistency and scalability.
 *
 * @example
 * ```tsx
 * import { useState } from 'react';
 * import type { FormErrors } from '@/lib/forms';
 * import { validateEmail, validateRequired } from '@/lib/forms';
 * import { createEmptyErrors } from '@/lib/forms';
 *
 * const [errors, setErrors] = useState<FormErrors>(createEmptyErrors());
 *
 * const validate = () => {
 *   const newErrors: FormErrors = {};
 *   const emailError = validateEmail(formData.email);
 *   if (emailError) newErrors.email = emailError;
 *   setErrors(newErrors);
 *   return Object.keys(newErrors).length === 0;
 * };
 * ```
 */

// Types
export type {
  FormErrors,
  FormDataBase,
  ValidationResult,
  FieldValidator,
  ValidationSchema,
} from "./types";

// Validators
export {
  validateEmail,
  validatePhone,
  validateRequired,
  validateZipCode,
  validateName,
  validateLength,
  composeValidators,
} from "./validators";

// Utilities
export {
  createEmptyErrors,
  clearFieldError,
  setFieldError,
  mergeErrors,
  hasErrors,
  getFirstErrorField,
  createValidationResult,
} from "./utils";
