import { NextResponse } from "next/server";
import { getServerTokens } from "@/lib/auth/cookies";

export async function GET() {
  const { access, user } = await getServerTokens();
  return NextResponse.json({
    authenticated: Boolean(access && user),
    user: user ?? null,
  });
}
