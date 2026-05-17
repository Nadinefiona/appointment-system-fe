import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  accessCookieOptions,
  refreshCookieOptions,
  serializeUser,
  userCookieOptions,
} from "@/lib/auth/cookies";
import { obtainToken } from "@/lib/auth/server-api";
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_USER,
} from "@/lib/constants";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  try {
    const tokens = await obtainToken(body.email, body.password);
    const store = await cookies();

    store.set(COOKIE_ACCESS, tokens.access, accessCookieOptions());
    store.set(COOKIE_REFRESH, tokens.refresh, refreshCookieOptions());
    store.set(COOKIE_USER, serializeUser(tokens.user), userCookieOptions());

    return NextResponse.json({
      access: tokens.access,
      refresh: tokens.refresh,
      user: tokens.user,
    });
  } catch (error) {
    if (error && typeof error === "object" && "status" in error) {
      const apiError = error as { status: number; message: string };
      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status },
      );
    }
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
