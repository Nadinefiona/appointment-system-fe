import { ApiError, parseApiError } from "@/lib/api/errors";
import type { PaginatedResponse } from "@/types/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  params?: Record<string, string | number | undefined | null>;
  auth?: boolean;
}

function normalizeApiPath(path: string): string {
  const trimmed = path.replace(/^\//, "").trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
}

function buildProxyUrl(
  path: string,
  params?: Record<string, string | number | undefined | null>,
): string {
  const cleanPath = normalizeApiPath(path);
  const url = new URL(`/api/proxy/${cleanPath}`, window.location.origin);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, params, auth = true } = options;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildProxyUrl(path, params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    apiRequest<T>(path, { method: "GET", params }),

  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),

  patch: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PATCH", body }),

  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body }),

  delete: <T>(path: string) => apiRequest<T>(path, { method: "DELETE" }),
};

export async function fetchAllPages<T>(
  firstPath: string,
  params?: Record<string, string | number | undefined | null>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await api.get<PaginatedResponse<T>>(firstPath, {
      ...params,
      page,
    });
    items.push(...data.results);
    hasMore = Boolean(data.next);
    page += 1;
  }

  return items;
}

export { ApiError };
