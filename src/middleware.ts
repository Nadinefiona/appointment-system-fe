import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  COOKIE_ACCESS,
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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(COOKIE_ACCESS)?.value;
  const user = parseUserCookie(request.cookies.get(COOKIE_USER)?.value);

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)),
  );
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isApi = pathname.startsWith("/api/");

  if (isApi) {
    return NextResponse.next();
  }

  if (!access && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (access && user && isAuthPage) {
    return NextResponse.redirect(new URL(homeForRole(user.role), request.url));
  }

  if (access && user) {
    for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [
      UserRole,
      string,
    ][]) {
      if (pathname.startsWith(prefix) && user.role !== role) {
        return NextResponse.redirect(new URL(homeForRole(user.role), request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
