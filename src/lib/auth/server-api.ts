import { API_BASE } from "@/lib/constants";
import { parseApiError } from "@/lib/api/errors";
import type { RefreshResponse, TokenResponse } from "@/types/api";

export async function djangoFetch(
  path: string,
  init?: RequestInit & { accessToken?: string | null },
): Promise<Response> {
  const { accessToken, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  headers.set("Accept", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  });
}

export async function obtainToken(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await djangoFetch("/api/token/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<TokenResponse>;
}

export async function refreshToken(
  refresh: string,
): Promise<RefreshResponse> {
  const res = await djangoFetch("/api/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<RefreshResponse>;
}
