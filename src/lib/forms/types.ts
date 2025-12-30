/**
 * Form error types - Scalable pattern used by premium companies (Stripe, Linear, Vercel)
 *
 * Using Record<string, string> allows:
 * - Dynamic field addition without type changes
 * - Consistent error handling across all forms
 * - Type-safe error access with proper inference
 * - Future-proof for 2026-2027+ requirements
 */

/**
 * Base type for form errors - flexible and scalable
 * All form errors should use this pattern
 */
export type FormErrors = Record<string, string>;

/**
 * Generic form data type helper
 * Use this for type-safe form state management
 */
export type FormDataBase = Record<string, unknown>;

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
}

/**
 * Field validation function type
 */
export type FieldValidator<T = string> = (value: T) => string | undefined;

/**
 * Form validation schema type
 */
export type ValidationSchema<T extends FormDataBase> = {
  [K in keyof T]?: FieldValidator<T[K]>;
};
