import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  accessCookieOptions,
  getServerTokens,
  refreshCookieOptions,
} from "@/lib/auth/cookies";
import { djangoFetch, refreshToken } from "@/lib/auth/server-api";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/constants";

async function forward(
  request: NextRequest,
  pathSegments: string[],
  accessToken: string | null,
): Promise<Response> {
  const url = new URL(request.url);
  const joined = pathSegments.filter(Boolean).join("/");
  const apiPath = `/api/${joined}/${url.search}`;

  const init: RequestInit & { accessToken?: string | null } = {
    method: request.method,
    accessToken,
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text();
    if (text) {
      init.body = text;
    }
  }

  return djangoFetch(apiPath, init);
}

async function tryRefresh(): Promise<string | null> {
  const { refresh } = await getServerTokens();
  if (!refresh) return null;
  try {
    const data = await refreshToken(refresh);
    const store = await cookies();
    store.set(COOKIE_ACCESS, data.access, accessCookieOptions());
    if (data.refresh) {
      store.set(COOKIE_REFRESH, data.refresh, refreshCookieOptions());
    }
    return data.access;
  } catch {
    const store = await cookies();
    store.delete(COOKIE_ACCESS);
    store.delete(COOKIE_REFRESH);
    return null;
  }
}

async function handler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  let { access } = await getServerTokens();

  let response = await forward(request, path, access);

  if (response.status === 401 && (await getServerTokens()).refresh) {
    const newAccess = await tryRefresh();
    if (newAccess) {
      response = await forward(request, path, newAccess);
    }
  }

  if (response.status === 204 || response.status === 205) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.arrayBuffer();
  const headers = new Headers();
  const contentType = response.headers.get("Content-Type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  } else if (body.byteLength > 0) {
    headers.set("Content-Type", "application/json");
  }

  return new NextResponse(body.byteLength > 0 ? body : null, {
    status: response.status,
    headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
