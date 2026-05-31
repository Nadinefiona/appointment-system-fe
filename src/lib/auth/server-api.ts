import { API_BASE } from "@/lib/constants";
import { parseApiError } from "@/lib/api/errors";
import type {
  AuthUser,
  MeProfile,
  RefreshResponse,
  TokenResponse,
  UserRole,
} from "@/types/api";

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

function normalizeRole(role: unknown): UserRole {
  const value = String(role ?? "client").toLowerCase();
  if (value === "provider" || value === "admin") return value;
  return "client";
}

export function toAuthUser(
  user: Pick<MeProfile, "id" | "email" | "role">,
): AuthUser {
  return {
    id: String(user.id),
    email: user.email,
    role: normalizeRole(user.role),
  };
}

export async function fetchMe(accessToken: string): Promise<MeProfile> {
  const res = await djangoFetch("/api/me/", { accessToken });
  if (!res.ok) throw await parseApiError(res);
  return res.json() as Promise<MeProfile>;
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

  const tokens = (await res.json()) as TokenResponse;
  if (tokens.user?.id && tokens.user?.email && tokens.user?.role) {
    return {
      ...tokens,
      user: toAuthUser(tokens.user as MeProfile),
    };
  }

  const me = await fetchMe(tokens.access);
  return {
    ...tokens,
    user: toAuthUser(me),
  };
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
