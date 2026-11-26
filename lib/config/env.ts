export type PlatformDataSourceMode = "api" | "mock" | "fixture";

export interface PlatformFrontendEnvConfig {
  appEnv: "development" | "test" | "staging" | "production";
  isProduction: boolean;
  platformApiBaseUrl: string;
  dataSourceMode: PlatformDataSourceMode;
  mockAuthEnabled: boolean;
}

const DEFAULT_PLATFORM_API_BASE_URL = "/api/platform/v1";

function normalizePlatformApiBaseUrl(rawUrl: string | undefined): string {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) {
    return DEFAULT_PLATFORM_API_BASE_URL;
  }
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\/+$/, "") || DEFAULT_PLATFORM_API_BASE_URL;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString().replace(/\/+$/, "");
    }
  } catch {
    // Fall back safely on invalid env URL
  }
  if (typeof console !== "undefined") {
    console.warn(
      `[Platform Env] Invalid NEXT_PUBLIC_PLATFORM_API_URL="${trimmed}"; falling back to "${DEFAULT_PLATFORM_API_BASE_URL}".`
    );
  }
  return DEFAULT_PLATFORM_API_BASE_URL;
}

function isRunningUnderTestHarness(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.NEXT_PUBLIC_APP_ENV === "test" ||
    process.env.NODE_TEST_CONTEXT !== undefined
  );
}

function resolvePlatformDataSourceMode(
  isProduction: boolean
): PlatformDataSourceMode {
  if (isProduction) {
    return "api";
  }

  const explicit = (process.env.NEXT_PUBLIC_DATA_SOURCE || "")
    .trim()
    .toLowerCase();
  if (explicit === "api" || explicit === "mock" || explicit === "fixture") {
    return explicit;
  }

  if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") {
    return "mock";
  }

  if (isRunningUnderTestHarness()) {
    return "fixture";
  }

  return "api";
}

export function getPlatformFrontendEnvConfig(): PlatformFrontendEnvConfig {
  const isProduction = process.env.NODE_ENV === "production";
  const rawAppEnv = (process.env.NEXT_PUBLIC_APP_ENV || "").trim().toLowerCase();
  const appEnv: PlatformFrontendEnvConfig["appEnv"] = isProduction
    ? "production"
    : rawAppEnv === "test" || isRunningUnderTestHarness()
      ? "test"
      : rawAppEnv === "staging"
        ? "staging"
        : "development";

  return {
    appEnv,
    isProduction,
    platformApiBaseUrl: normalizePlatformApiBaseUrl(
      process.env.NEXT_PUBLIC_PLATFORM_API_URL
    ),
    dataSourceMode: resolvePlatformDataSourceMode(isProduction),
    mockAuthEnabled:
      !isProduction && process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true",
  };
}
