import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS,
  COOKIE_REFRESH,
  COOKIE_USER,
} from "@/lib/constants";

export async function POST() {
  const store = await cookies();
  store.delete(COOKIE_ACCESS);
  store.delete(COOKIE_REFRESH);
  store.delete(COOKIE_USER);
  return NextResponse.json({ ok: true });
}
