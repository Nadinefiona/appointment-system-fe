import type { AuthUser } from "@/types/api";

export function parseUserCookie(value?: string): AuthUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    return null;
  }
}

export function serializeUser(user: AuthUser): string {
  return JSON.stringify(user);
}
