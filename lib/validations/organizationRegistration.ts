import { z } from "zod";
import { CANONICAL_SCHOOL_TYPES } from "@/lib/modules/canonical-contract";

export const ORGANIZATION_OWNERSHIP_TYPES = [
  "private",
  "public",
  "faith_based",
  "non_profit",
  "corporate",
  "network",
  "government",
] as const;

export const registrationIdentitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "School display name must be at least 2 characters.")
    .max(120, "School display name cannot exceed 120 characters."),
  legalName: z
    .string()
    .trim()
    .max(160, "Legal name cannot exceed 160 characters.")
    .optional()
    .or(z.literal("")),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{2,14}$/, "Code must be 2-14 alphanumeric, underscore, or hyphen characters."),
  organizationType: z.enum(ORGANIZATION_OWNERSHIP_TYPES),
  subdomain: z
    .string()
    .trim()
    .regex(
      /^[a-z0-9](?:[a-z0-9-]{0,46}[a-z0-9])?$/,
      "Subdomain slug must use lowercase letters, numbers, and hyphens only."
    ),
});

export const registrationClassificationSchema = z.object({
  classification: z.enum([
    "nursery",
    "primary",
    "secondary",
    "combined",
    "college",
    "vocational",
    "international",
    "k12",
    "higher_education",
  ]),
  institutionCategories: z
    .array(z.enum(CANONICAL_SCHOOL_TYPES))
    .min(1, "Select at least one institutional category."),
});

export const registrationContactSchema = z.object({
  email: z.string().trim().email("Enter a valid official school email address."),
  phone: z.string().trim().min(5, "Official telephone number is required."),
  country: z.string().trim().min(2, "Country is required."),
  stateOrProvince: z.string().trim().min(1, "State / region is required."),
  city: z.string().trim().min(1, "City is required."),
  address: z.string().trim().min(2, "Street address is required."),
  postalCode: z.string().trim().optional().or(z.literal("")),
  website: z
    .string()
    .trim()
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Website URL must begin with http:// or https://."
    )
    .optional(),
});

export const registrationAdminSchema = z.object({
  name: z.string().trim().min(2, "Primary administrator name is required."),
  roleTitle: z.string().trim().min(2, "Administrator title is required."),
  email: z.string().trim().email("Enter a valid administrator email address."),
  phone: z.string().trim().min(5, "Administrator telephone number is required."),
});

export const registrationCampusSchema = z.object({
  name: z.string().trim().min(2, "Initial campus name is required."),
  code: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{2,16}$/, "Campus code must be 2-16 alphanumeric characters."),
  type: z.enum(["main", "branch", "virtual", "specialized"]).default("main"),
  street: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(1, "Campus city is required."),
  stateOrProvince: z.string().trim().optional().or(z.literal("")),
  country: z.string().trim().min(2, "Campus country is required."),
  postalCode: z.string().trim().optional().or(z.literal("")),
  studentCapacity: z.coerce
    .number()
    .int()
    .min(10, "Campus capacity must be at least 10 students.")
    .max(50000, "Capacity cannot exceed 50,000."),
});

export const registrationSubscriptionSchema = z.object({
  planId: z.string().trim().min(1, "Select a valid subscription plan."),
  billingCycle: z.enum(["monthly", "annual"]),
  startTrial: z.boolean().default(true),
  maxCampuses: z.coerce.number().int().min(1, "At least 1 campus must be allowed.").max(500),
  timezone: z.string().trim().min(2, "Timezone is required."),
  currency: z.string().trim().length(3, "Use 3-letter ISO currency code (e.g. USD)."),
  locale: z.string().trim().min(2, "Locale is required."),
  academicYearStartMonth: z.coerce.number().int().min(1).max(12),
});

export function extractZodFieldErrors(error: z.ZodError, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const pathKey = issue.path.join(".");
    const key = prefix ? (pathKey ? `${prefix}.${pathKey}` : prefix) : pathKey;
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
