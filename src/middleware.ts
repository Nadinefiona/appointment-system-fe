import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_USER,
} from "@/lib/constants";
import { parseUserCookie } from "@/lib/auth/user-cookie";
import type { UserRole } from "@/types/api";

const PUBLIC_PATHS = ["/", "/login", "/register"];

const ROLE_PREFIX: Record<UserRole, string> = {
  client: "/client",
  provider: "/provider",
  admin: "/admin",
};

function homeForRole(role: UserRole): string {
  if (role === "client") return "/client/providers";
  if (role === "provider") return "/provider/dashboard";
  return "/admin/providers";
}

function applySetCookies(response: NextResponse, setCookies: string[]) {
  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", cookie);
  }
}

/** Silently refresh access token when it expired but refresh cookie is still valid. */
async function tryRefreshAccess(
  request: NextRequest,
): Promise<{ access: string | null; setCookies: string[] }> {
  const refreshRes = await fetch(new URL("/api/auth/refresh", request.url), {
    method: "POST",
    headers: {
      Cookie: request.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });

  if (!refreshRes.ok) {
    return { access: null, setCookies: [] };
  }

  const setCookies = refreshRes.headers.getSetCookie();
  const accessCookie = setCookies.find((c) => c.startsWith(`${COOKIE_ACCESS}=`));
  const access = accessCookie?.split(";")[0]?.split("=")?.[1] ?? null;
  return { access, setCookies };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let access = request.cookies.get(COOKIE_ACCESS)?.value;
  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;
  let refreshedCookies: string[] = [];

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isApi = pathname.startsWith("/api/");

  if (isApi) {
    return NextResponse.next();
  }

  if (!access && refresh && !isPublic) {
    const refreshed = await tryRefreshAccess(request);
    if (refreshed.access) {
      access = refreshed.access;
      refreshedCookies = refreshed.setCookies;
    }
  }

  const user = parseUserCookie(request.cookies.get(COOKIE_USER)?.value);

  if (!access && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (access && user && isAuthPage) {
    const response = NextResponse.redirect(
      new URL(homeForRole(user.role), request.url),
    );
    applySetCookies(response, refreshedCookies);
    return response;
  }

  if (access && user) {
    for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [
      UserRole,
      string,
    ][]) {
      if (pathname.startsWith(prefix) && user.role !== role) {
        const response = NextResponse.redirect(
          new URL(homeForRole(user.role), request.url),
        );
        applySetCookies(response, refreshedCookies);
        return response;
      }
    }
  }

  const response = NextResponse.next();
  applySetCookies(response, refreshedCookies);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
