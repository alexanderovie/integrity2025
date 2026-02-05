import type { CountryCode } from "libphonenumber-js";
import { parsePhoneNumberFromString } from "libphonenumber-js";

type NormalizePhoneOptions = {
  defaultCountry?: CountryCode;
  allowedCountries?: CountryCode[];
  required?: boolean;
};

export type NormalizedPhoneResult = {
  isValid: boolean;
  e164?: string;
  national?: string;
  country?: CountryCode;
  error?: string;
};

const DEFAULT_COUNTRY: CountryCode = "US";
const DEFAULT_ALLOWED: CountryCode[] = ["US", "CA"];

export const normalizePhone = (
  input: string,
  options: NormalizePhoneOptions = {},
): NormalizedPhoneResult => {
  const { defaultCountry = DEFAULT_COUNTRY, allowedCountries = DEFAULT_ALLOWED, required = true } = options;
  const raw = input?.trim() ?? "";

  if (!raw) {
    return {
      isValid: false,
      error: required ? "Phone number is required." : undefined,
    };
  }

  const tryParse = (country?: CountryCode) =>
    country ? parsePhoneNumberFromString(raw, country) : parsePhoneNumberFromString(raw);

  let parsed = tryParse(defaultCountry);

  if (!parsed && defaultCountry === "US" && allowedCountries.includes("CA")) {
    parsed = tryParse("CA");
  }

  if (!parsed || !parsed.isValid()) {
    return {
      isValid: false,
      error: "Enter a valid phone number (US/CA).",
    };
  }

  if (allowedCountries.length > 0 && parsed.country && !allowedCountries.includes(parsed.country)) {
    return {
      isValid: false,
      error: "Phone number country is not supported.",
    };
  }

  return {
    isValid: true,
    e164: parsed.number,
    national: parsed.formatNational(),
    country: parsed.country,
  };
};

export const validatePhoneInput = (
  input: string,
  options: NormalizePhoneOptions = {},
): string | undefined => {
  const result = normalizePhone(input, options);
  if (!result.isValid) {
    return result.error || "Enter a valid phone number.";
  }
  return undefined;
};
