import { z } from "zod";
import type { ApiErrorCode } from "./dataSource";
import { PlatformApiError } from "./dataSource";

export const nonEmptyIdSchema = z.string().trim().min(1, "ID is required");

export const isoDateOrDateTimeSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Expected valid ISO date/datetime string",
  });

export const sortOrderSchema = z.enum(["asc", "desc"]);

export const basePlatformQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(500).optional(),
    search: z.string().trim().optional(),
    sortBy: z.string().trim().optional(),
    sortOrder: sortOrderSchema.optional(),
    status: z.string().trim().optional(),
    startDate: isoDateOrDateTimeSchema.optional(),
    endDate: isoDateOrDateTimeSchema.optional(),
  })
  .strict();

export const apiPaginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNextPage: z.boolean().optional(),
  hasPrevPage: z.boolean().optional(),
});

export interface PlatformApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: { code: ApiErrorCode | string; message: string; details?: unknown } | string;
  timestamp: string;
}

export interface PlatformPaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: z.infer<typeof apiPaginationMetaSchema>;
  message?: string;
  timestamp: string;
}

export function platformApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
    timestamp: z.string(),
  });
}

export function platformPaginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T
) {
  return z.object({
    success: z.boolean(),
    data: z.array(itemSchema),
    meta: apiPaginationMetaSchema,
    message: z.string().optional(),
    timestamp: z.string(),
  });
}

export const organizationStatusSchema = z.enum([
  "active",
  "suspended",
  "pending",
  "inactive",
  "draft",
  "archived",
]);

export const organizationClassificationSchema = z.enum([
  "k12",
  "primary",
  "secondary",
  "higher_education",
  "vocational",
  "international",
]);

export const organizationSchema = z
  .object({
    id: nonEmptyIdSchema,
    name: z.string().trim().min(1),
    code: z.string().trim().min(1),
    subdomain: z.string().trim().min(1),
    planId: nonEmptyIdSchema,
    status: organizationStatusSchema,
    classification: organizationClassificationSchema,
    onboardingStatus: z
      .enum(["not_started", "in_progress", "verification_pending", "completed"])
      .optional(),
    studentCountEstimate: z.number().int().min(0).optional(),
    staffCountEstimate: z.number().int().min(0).optional(),
    technicalConfig: z
      .object({
        subdomain: z.string().trim().min(1),
        customDomain: z.string().optional(),
        maxCampuses: z.number().int().min(0),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const campusSchema = z
  .object({
    id: nonEmptyIdSchema,
    organizationId: nonEmptyIdSchema,
    name: z.string().trim().min(1),
    code: z.string().trim().min(1),
    status: z.enum(["active", "inactive", "archived", "under_review"]),
    isMainCampus: z.boolean(),
  })
  .passthrough();

export const subscriptionPlanSchema = z
  .object({
    id: nonEmptyIdSchema,
    name: z.string().trim().min(1),
    tier: z.enum(["starter", "growth", "enterprise", "custom"]),
    status: z.enum(["published", "draft", "deprecated", "archived"]),
    priceMonthly: z.number().min(0),
    priceAnnual: z.number().min(0),
    currency: z.string().trim().min(3),
    maxStudents: z.number().int().min(0),
    maxStaff: z.number().int().min(0),
    maxCampuses: z.number().int().min(0),
    includedModuleIds: z.array(nonEmptyIdSchema),
    isActive: z.boolean(),
  })
  .passthrough();

export const organizationSubscriptionSchema = z
  .object({
    id: nonEmptyIdSchema,
    organizationId: nonEmptyIdSchema,
    planId: nonEmptyIdSchema,
    billingCycle: z.enum(["monthly", "annual", "quarterly"]),
    status: z.enum(["active", "trialing", "past_due", "canceled", "expired"]),
  })
  .passthrough();

export const studentOversightRecordSchema = z
  .object({
    organizationId: nonEmptyIdSchema,
    organizationName: z.string().trim().min(1),
    organizationCode: z.string().trim().min(1),
    isReporting: z.boolean(),
  })
  .passthrough();

export const academicOversightRecordSchema = z
  .object({
    organizationId: nonEmptyIdSchema,
    organizationName: z.string().trim().min(1),
    organizationCode: z.string().trim().min(1),
    isReporting: z.boolean(),
  })
  .passthrough();

export const examGovernanceRecordSchema = z
  .object({
    organizationId: nonEmptyIdSchema,
    organizationName: z.string().trim().min(1),
    organizationCode: z.string().trim().min(1),
  })
  .passthrough();

function formatZodIssues(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  }
  return out;
}

export function validateRequestPayload<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  payload: unknown,
  context = "platform request payload"
): z.infer<TSchema> {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new PlatformApiError(
      `Invalid ${context}. Please review the submitted fields.`,
      422,
      "VALIDATION_ERROR",
      formatZodIssues(result.error)
    );
  }
  return result.data;
}

export function validateApiResponse<TData>(
  dataSchema: z.ZodType<TData>,
  envelope: PlatformApiResponse<unknown>,
  operation = "Platform API response"
): PlatformApiResponse<TData> {
  const parsed = platformApiResponseSchema(dataSchema).safeParse(envelope);
  if (!parsed.success) {
    throw new PlatformApiError(
      `Unexpected ${operation} response shape received from backend.`,
      502,
      "INVALID_RESPONSE",
      formatZodIssues(parsed.error)
    );
  }
  return parsed.data as PlatformApiResponse<TData>;
}

export function validatePaginatedResponse<TItem>(
  itemSchema: z.ZodType<TItem>,
  envelope: PlatformPaginatedResponse<unknown>,
  operation = "Platform paginated API response"
): PlatformPaginatedResponse<TItem> {
  const parsed = platformPaginatedResponseSchema(itemSchema).safeParse(envelope);
  if (!parsed.success) {
    throw new PlatformApiError(
      `Unexpected ${operation} paginated payload received from backend.`,
      502,
      "INVALID_RESPONSE",
      formatZodIssues(parsed.error)
    );
  }
  return parsed.data as PlatformPaginatedResponse<TItem>;
}
