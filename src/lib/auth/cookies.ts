import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_USER,
} from "@/lib/constants";
import type { AuthUser } from "@/types/api";
import { parseUserCookie, serializeUser } from "@/lib/auth/user-cookie";

export { parseUserCookie, serializeUser };

const isProd = process.env.NODE_ENV === "production";

const baseCookieOptions: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
};

export function accessCookieOptions(): Partial<ResponseCookie> {
  return {
    ...baseCookieOptions,
    maxAge: 60 * 30,
  };
}

export function refreshCookieOptions(): Partial<ResponseCookie> {
  return {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24,
  };
}

export function userCookieOptions(): Partial<ResponseCookie> {
  return {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24,
  };
}

export async function getServerTokens() {
  const store = await cookies();
  return {
    access: store.get(COOKIE_ACCESS)?.value ?? null,
    refresh: store.get(COOKIE_REFRESH)?.value ?? null,
    user: parseUserCookie(store.get(COOKIE_USER)?.value),
  };
}
