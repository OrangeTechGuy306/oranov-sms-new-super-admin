import { z } from "zod";
import {
  getPlatformFrontendEnvConfig,
  type PlatformDataSourceMode,
} from "@/lib/config/env";
import {
  validateApiResponse,
  validatePaginatedResponse,
  validateRequestPayload,
  type PlatformApiResponse,
  type PlatformPaginatedResponse,
} from "./contracts";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "AUTHENTICATION_REQUIRED"
  | "SESSION_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "REQUEST_CANCELLED"
  | "INVALID_RESPONSE";

export class PlatformApiError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode | string;
  public readonly errors?: Record<string, string[]>;
  public readonly timestamp: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: ApiErrorCode | string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "PlatformApiError";
    this.statusCode = statusCode;
    this.code = code || PlatformApiError.inferCode(statusCode);
    this.errors = errors;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, PlatformApiError.prototype);
  }

  private static inferCode(status: number): ApiErrorCode {
    switch (status) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "AUTHENTICATION_REQUIRED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "VALIDATION_ERROR";
      case 429:
        return "RATE_LIMITED";
      case 502:
        return "INVALID_RESPONSE";
      case 503:
        return "SERVICE_UNAVAILABLE";
      default:
        return status >= 500 ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST";
    }
  }

  public isAuthError(): boolean {
    return this.statusCode === 401;
  }

  public isAuthorizationError(): boolean {
    return this.statusCode === 403;
  }

  public isValidationError(): boolean {
    return (
      this.statusCode === 400 ||
      this.statusCode === 422 ||
      this.code === "VALIDATION_ERROR"
    );
  }

  public isConflict(): boolean {
    return this.statusCode === 409 || this.code === "CONFLICT";
  }

  public isNotFound(): boolean {
    return this.statusCode === 404 || this.code === "NOT_FOUND";
  }

  public isNetworkError(): boolean {
    return (
      this.statusCode === 503 ||
      this.code === "NETWORK_ERROR" ||
      this.code === "SERVICE_UNAVAILABLE"
    );
  }

  public isInvalidResponse(): boolean {
    return this.statusCode === 502 || this.code === "INVALID_RESPONSE";
  }

  public isRetryable(): boolean {
    return this.statusCode >= 500 || this.statusCode === 429;
  }
}

export function getUserFriendlyPlatformError(error: unknown): {
  title: string;
  message: string;
  retryable: boolean;
} {
  if (error instanceof PlatformApiError) {
    if (error.isAuthError()) {
      return {
        title: "Platform Session Required",
        message: "Your platform administrator session is missing or expired. Sign in again to continue.",
        retryable: false,
      };
    }
    if (error.isAuthorizationError()) {
      return {
        title: "Platform Access Denied",
        message: "Your platform role does not have permission for this administrative action.",
        retryable: false,
      };
    }
    if (error.isValidationError()) {
      return {
        title: "Validation Failed",
        message: error.message || "Please review the submitted fields and try again.",
        retryable: false,
      };
    }
    if (error.isConflict()) {
      return {
        title: "Conflict Detected",
        message: error.message || "This platform record was modified elsewhere.",
        retryable: false,
      };
    }
    if (error.isNotFound()) {
      return {
        title: "Record Not Found",
        message: error.message || "The requested platform resource could not be found.",
        retryable: false,
      };
    }
    if (error.isInvalidResponse()) {
      return {
        title: "Unexpected Response",
        message: "Received malformed data from the platform API contract.",
        retryable: true,
      };
    }
    if (error.isNetworkError()) {
      return {
        title: "Platform API Unavailable",
        message: "Unable to reach the platform service endpoint. Check connectivity and retry.",
        retryable: true,
      };
    }
    return {
      title: "Platform Request Failed",
      message: error.message || "An unexpected platform error occurred.",
      retryable: error.isRetryable(),
    };
  }

  return {
    title: "Unexpected Error",
    message:
      error instanceof Error && error.message
        ? error.message
        : "An unexpected platform error occurred.",
    retryable: false,
  };
}

let runtimeDataSourceOverride: PlatformDataSourceMode | null = null;
let mockFaultInjector:
  | ((operationName: string) => PlatformApiError | Error | null)
  | null = null;

export function getPlatformDataSourceMode(): PlatformDataSourceMode {
  if (process.env.NODE_ENV === "production") {
    return "api";
  }
  if (runtimeDataSourceOverride !== null) {
    return runtimeDataSourceOverride;
  }
  return getPlatformFrontendEnvConfig().dataSourceMode;
}

export function setPlatformDataSourceOverride(
  mode: PlatformDataSourceMode | null
): void {
  if (process.env.NODE_ENV === "production") {
    runtimeDataSourceOverride = null;
    return;
  }
  runtimeDataSourceOverride = mode;
}

export async function withPlatformDataSourceMode<T>(
  mode: PlatformDataSourceMode,
  fn: () => Promise<T> | T
): Promise<T> {
  const prev = runtimeDataSourceOverride;
  setPlatformDataSourceOverride(mode);
  try {
    return await fn();
  } finally {
    setPlatformDataSourceOverride(prev);
  }
}

export function setPlatformMockFaultInjector(
  injector:
    | ((operationName: string) => PlatformApiError | Error | null)
    | null
): void {
  if (process.env.NODE_ENV === "production") {
    mockFaultInjector = null;
    return;
  }
  mockFaultInjector = injector;
}

export interface ExecutePlatformAdapterOptions<TData, TPayload = unknown> {
  operation: string;
  remote: () => Promise<PlatformApiResponse<TData> | undefined>;
  mock: () =>
    | TData
    | PlatformApiResponse<TData>
    | Promise<TData | PlatformApiResponse<TData>>;
  mockMessage?: string;
  payload?: TPayload;
  requestSchema?: z.ZodType<TPayload>;
  responseSchema?: z.ZodType<TData>;
}

function normalizeMockEnvelope<TData>(
  raw: TData | PlatformApiResponse<TData>,
  mockMessage?: string
): PlatformApiResponse<TData> {
  if (
    raw !== null &&
    typeof raw === "object" &&
    "success" in raw &&
    typeof (raw as PlatformApiResponse<TData>).success === "boolean" &&
    ("data" in raw || "error" in raw)
  ) {
    const env = raw as PlatformApiResponse<TData>;
    return {
      ...env,
      message: env.message ?? mockMessage,
      timestamp: env.timestamp || new Date().toISOString(),
    };
  }
  return {
    success: true,
    data: raw as TData,
    message: mockMessage,
    timestamp: new Date().toISOString(),
  };
}

export async function executePlatformAdapter<TData, TPayload = unknown>(
  options: ExecutePlatformAdapterOptions<TData, TPayload>
): Promise<PlatformApiResponse<TData>> {
  if (options.requestSchema && options.payload !== undefined) {
    validateRequestPayload(
      options.requestSchema,
      options.payload,
      `${options.operation} request`
    );
  }

  const mode = getPlatformDataSourceMode();

  if (mode === "api") {
    const response = await options.remote();
    if (!response || response.data === undefined) {
      throw new PlatformApiError(
        `Empty or malformed response received for ${options.operation}.`,
        502,
        "INVALID_RESPONSE"
      );
    }
    if (options.responseSchema) {
      return validateApiResponse(
        options.responseSchema,
        response,
        options.operation
      );
    }
    return response;
  }

  if (mockFaultInjector) {
    const injected = mockFaultInjector(options.operation);
    if (injected) {
      throw injected;
    }
  }

  const mockResult = await options.mock();
  const envelope = normalizeMockEnvelope(mockResult, options.mockMessage);

  if (options.responseSchema && envelope.success) {
    return validateApiResponse(
      options.responseSchema,
      envelope,
      options.operation
    );
  }

  return envelope;
}

export interface ExecutePlatformPaginatedAdapterOptions<TItem> {
  operation: string;
  remote: () => Promise<PlatformPaginatedResponse<TItem> | undefined>;
  mock: () =>
    | PlatformPaginatedResponse<TItem>
    | Promise<PlatformPaginatedResponse<TItem>>;
  itemSchema?: z.ZodType<TItem>;
}

export async function executePlatformPaginatedAdapter<TItem>(
  options: ExecutePlatformPaginatedAdapterOptions<TItem>
): Promise<PlatformPaginatedResponse<TItem>> {
  const mode = getPlatformDataSourceMode();

  if (mode === "api") {
    const response = await options.remote();
    if (!response || !Array.isArray(response.data)) {
      throw new PlatformApiError(
        `Empty or malformed paginated response received for ${options.operation}.`,
        502,
        "INVALID_RESPONSE"
      );
    }
    if (options.itemSchema) {
      return validatePaginatedResponse(
        options.itemSchema,
        response,
        options.operation
      );
    }
    return response;
  }

  if (mockFaultInjector) {
    const injected = mockFaultInjector(options.operation);
    if (injected) {
      throw injected;
    }
  }

  const response = await options.mock();
  if (options.itemSchema) {
    return validatePaginatedResponse(
      options.itemSchema,
      response,
      options.operation
    );
  }
  return response;
}
