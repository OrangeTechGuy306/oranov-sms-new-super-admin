import { getPlatformFrontendEnvConfig } from "@/lib/config/env";
import type {
  PlatformApiResponse,
  PlatformPaginatedResponse,
} from "./contracts";
import { PlatformApiError } from "./dataSource";

export interface PlatformRequestOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

class PlatformApiClient {
  private accessToken: string | null = null;
  private onUnauthorized?: () => void;

  public getBaseUrl(): string {
    return getPlatformFrontendEnvConfig().platformApiBaseUrl;
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public configureAuthHandlers(handlers: {
    onUnauthorized?: () => void;
  }): void {
    this.onUnauthorized = handlers.onUnauthorized;
  }

  private buildUrl(
    endpoint: string,
    params?: PlatformRequestOptions["params"]
  ): string {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    let fullUrl = `${baseUrl}${cleanEndpoint}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const query = searchParams.toString();
      if (query) {
        fullUrl += `?${query}`;
      }
    }

    return fullUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    options: PlatformRequestOptions = {}
  ): Promise<T> {
    const url = this.buildUrl(endpoint, options.params);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        credentials: "include",
        signal: options.signal,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new PlatformApiError("Platform request cancelled.", 499, "REQUEST_CANCELLED");
      }
      throw new PlatformApiError(
        error instanceof Error
          ? `Platform network error: ${error.message}`
          : "Unable to connect to platform API.",
        503,
        "NETWORK_ERROR"
      );
    }

    if (response.status === 401) {
      this.onUnauthorized?.();
    }

    if (response.status === 204) {
      return {
        success: true,
        data: undefined,
        timestamp: new Date().toISOString(),
      } as T;
    }

    const rawText = await response.text().catch(() => "");
    let parsed: Record<string, unknown> | null = null;
    if (rawText) {
      try {
        parsed = JSON.parse(rawText) as Record<string, unknown>;
      } catch {
        parsed = null;
      }
    }

    if (!response.ok) {
      const message =
        typeof parsed?.message === "string" && parsed.message.trim()
          ? parsed.message
          : response.statusText || `HTTP ${response.status} error`;
      const code =
        typeof parsed?.code === "string" ? parsed.code : undefined;
      const errors =
        parsed?.errors && typeof parsed.errors === "object"
          ? (parsed.errors as Record<string, string[]>)
          : undefined;
      throw new PlatformApiError(message, response.status, code, errors);
    }

    if (!parsed || typeof parsed !== "object") {
      throw new PlatformApiError(
        `Invalid non-JSON response received from platform endpoint "${endpoint}".`,
        502,
        "INVALID_RESPONSE"
      );
    }

    return parsed as T;
  }

  public get<T>(
    endpoint: string,
    options?: PlatformRequestOptions
  ): Promise<PlatformApiResponse<T>> {
    return this.request<PlatformApiResponse<T>>("GET", endpoint, undefined, options);
  }

  public getPaginated<T>(
    endpoint: string,
    options?: PlatformRequestOptions
  ): Promise<PlatformPaginatedResponse<T>> {
    return this.request<PlatformPaginatedResponse<T>>("GET", endpoint, undefined, options);
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: PlatformRequestOptions
  ): Promise<PlatformApiResponse<T>> {
    return this.request<PlatformApiResponse<T>>("POST", endpoint, body, options);
  }

  public patch<T>(
    endpoint: string,
    body?: unknown,
    options?: PlatformRequestOptions
  ): Promise<PlatformApiResponse<T>> {
    return this.request<PlatformApiResponse<T>>("PATCH", endpoint, body, options);
  }

  public delete<T>(
    endpoint: string,
    options?: PlatformRequestOptions
  ): Promise<PlatformApiResponse<T>> {
    return this.request<PlatformApiResponse<T>>("DELETE", endpoint, undefined, options);
  }
}

export const platformApiClient = new PlatformApiClient();
