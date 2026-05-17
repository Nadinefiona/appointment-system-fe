import type {
  AuthUser,
  RegisterResponse,
  TokenResponse,
  User,
} from "@/types/api";

export async function loginRequest(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      typeof body.error === "string" ? body.error : "Login failed",
    );
  }
  return res.json() as Promise<TokenResponse>;
}

export async function registerRequest(payload: {
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}): Promise<RegisterResponse> {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body.error ??
      (body.fieldErrors
        ? Object.entries(body.fieldErrors as Record<string, string[]>)
            .map(([k, v]) => `${k}: ${v.join(", ")}`)
            .join("; ")
        : "Registration failed");
    throw new Error(String(message));
  }
  return res.json() as Promise<RegisterResponse>;
}

export async function logoutRequest(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function getSessionRequest(): Promise<{
  user: AuthUser | null;
  authenticated: boolean;
}> {
  const res = await fetch("/api/auth/session", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    return { user: null, authenticated: false };
  }
  return res.json() as Promise<{ user: AuthUser | null; authenticated: boolean }>;
}

export async function fetchMe(): Promise<User> {
  const res = await fetch("/api/proxy/me/", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load profile");
  return res.json() as Promise<User>;
}
