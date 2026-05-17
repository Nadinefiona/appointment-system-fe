import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  accessCookieOptions,
  getServerTokens,
  refreshCookieOptions,
} from "@/lib/auth/cookies";
import { refreshToken } from "@/lib/auth/server-api";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/constants";

export async function POST() {
  const { refresh } = await getServerTokens();
  if (!refresh) {
    return NextResponse.json({ error: "No refresh token." }, { status: 401 });
  }

  try {
    const data = await refreshToken(refresh);
    const store = await cookies();
    store.set(COOKIE_ACCESS, data.access, accessCookieOptions());
    if (data.refresh) {
      store.set(COOKIE_REFRESH, data.refresh, refreshCookieOptions());
    }
    return NextResponse.json({ access: data.access, refresh: data.refresh });
  } catch {
    const store = await cookies();
    store.delete(COOKIE_ACCESS);
    store.delete(COOKIE_REFRESH);
    return NextResponse.json({ error: "Session expired." }, { status: 401 });
  }
}
