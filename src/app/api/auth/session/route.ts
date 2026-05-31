import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  accessCookieOptions,
  getServerTokens,
  refreshCookieOptions,
  userCookieOptions,
} from "@/lib/auth/cookies";
import { refreshToken } from "@/lib/auth/server-api";
import { COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_USER } from "@/lib/constants";

export async function GET() {
  let { access, refresh, user } = await getServerTokens();

  if (!access && refresh) {
    try {
      const data = await refreshToken(refresh);
      const store = await cookies();
      store.set(COOKIE_ACCESS, data.access, accessCookieOptions());
      if (data.refresh) {
        store.set(COOKIE_REFRESH, data.refresh, refreshCookieOptions());
      }
      access = data.access;
    } catch {
      const store = await cookies();
      store.delete(COOKIE_ACCESS);
      store.delete(COOKIE_REFRESH);
      store.delete(COOKIE_USER);
      user = null;
    }
  }

  return NextResponse.json({
    authenticated: Boolean(access && user),
    user: user ?? null,
  });
}
