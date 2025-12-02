import { z } from "zod";

/**
 * Esquemas de validación usando Zod
 * Proporcionan validación robusta y type-safe
 */

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
});

export const contactSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),
  firstname: z.string().max(100, "First name is too long").optional().or(z.literal("")),
  lastname: z.string().max(100, "Last name is too long").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]*$/, "Invalid phone number format")
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format")
    .optional()
    .or(z.literal("")),
  address: z.string().max(200, "Address is too long").optional().or(z.literal("")),
  city: z.string().max(100, "City name is too long").optional().or(z.literal("")),
  state: z.string().max(50, "State name is too long").optional().or(z.literal("")),
});

export const checkoutSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  customerEmail: z
    .string()
    .min(1, "Customer email is required")
    .email("Please provide a valid email address"),
  customerName: z.string().min(1, "Customer name is required").max(200, "Name is too long"),
  customPrice: z
    .number()
    .positive("Price must be positive")
    .max(1000000, "Price is too high")
    .optional(),
  quoteData: z
    .record(z.any())
    .optional()
    .refine(
      (data) => {
        if (!data) return true;
        try {
          JSON.stringify(data);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Invalid quote data format" }
    ),
});

/**
 * Schema for Meta Pixel API requests
 * Supports both raw PII (hashed server-side) and pre-hashed data
 *
 * According to Meta Conversions API v21.0 (December 2025):
 * - PII must be hashed with SHA-256
 * - Normalized to lowercase and trimmed
 * - Can accept raw data (hashed server-side) or pre-hashed data
 */
export const metaPixelSchema = z.object({
  event_name: z.string().min(1, "Event name is required"),
  user_data: z
    .object({
      // Raw PII fields (will be hashed server-side)
      email: z.string().email("Invalid email format").optional(),
      phone: z
        .string()
        .regex(/^[\d\s\-\+\(\)]*$/, "Invalid phone number format")
        .optional(),
      first_name: z.string().max(100, "First name too long").optional(),
      last_name: z.string().max(100, "Last name too long").optional(),
      // Pre-hashed fields (for advanced integrations)
      em: z.string().regex(/^[a-f0-9]{64}$/, "Invalid hash format (must be 64 hex chars)").optional(),
      ph: z.string().regex(/^[a-f0-9]{64}$/, "Invalid hash format (must be 64 hex chars)").optional(),
      fn: z.string().regex(/^[a-f0-9]{64}$/, "Invalid hash format (must be 64 hex chars)").optional(),
      ln: z.string().regex(/^[a-f0-9]{64}$/, "Invalid hash format (must be 64 hex chars)").optional(),
      // Non-PII fields
      external_id: z.string().max(100, "External ID too long").optional(),
      fbp: z.string().optional(), // Facebook browser ID
      fbc: z.string().optional(), // Facebook click ID
      // Server-side fields (ignored if provided, will be overwritten)
      client_ip_address: z.string().optional(),
      client_user_agent: z.string().optional(),
    })
    .refine(
      (data) => {
        // Ensure we don't have both raw and hashed versions of the same field
        const hasRawEmail = !!data.email;
        const hasHashedEmail = !!data.em;
        if (hasRawEmail && hasHashedEmail) {
          return false;
        }
        return true;
      },
      { message: "Cannot provide both raw and hashed email" }
    )
    .refine(
      (data) => {
        const hasRawPhone = !!data.phone;
        const hasHashedPhone = !!data.ph;
        if (hasRawPhone && hasHashedPhone) {
          return false;
        }
        return true;
      },
      { message: "Cannot provide both raw and hashed phone" }
    )
    .refine(
      (data) => {
        const hasRawFirstName = !!data.first_name;
        const hasHashedFirstName = !!data.fn;
        if (hasRawFirstName && hasHashedFirstName) {
          return false;
        }
        return true;
      },
      { message: "Cannot provide both raw and hashed first_name" }
    )
    .refine(
      (data) => {
        const hasRawLastName = !!data.last_name;
        const hasHashedLastName = !!data.ln;
        if (hasRawLastName && hasHashedLastName) {
          return false;
        }
        return true;
      },
      { message: "Cannot provide both raw and hashed last_name" }
    )
    .optional(),
  custom_data: z
    .object({
      value: z.number().optional(),
      currency: z.string().optional(),
      content_name: z.string().optional(),
      content_category: z.string().optional(),
      content_ids: z.array(z.string()).optional(),
      num_items: z.number().optional(),
      search_string: z.string().optional(),
    })
    .optional(),
  event_id: z.string().optional(),
  event_source_url: z.string().url().optional(),
  test_mode: z.boolean().optional(),
});

/**
 * Validación de tamaño de payload
 */
export const MAX_PAYLOAD_SIZE = 1024 * 100; // 100KB

export function validatePayloadSize(payload: string): boolean {
  return new Blob([payload]).size <= MAX_PAYLOAD_SIZE;
}
