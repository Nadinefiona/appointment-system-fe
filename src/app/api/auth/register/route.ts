import { NextResponse } from "next/server";
import { djangoFetch } from "@/lib/auth/server-api";
import { parseApiError, formatFieldErrors } from "@/lib/api/errors";

export async function POST(request: Request) {
  const body = await request.json();
  const res = await djangoFetch("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await parseApiError(res);
    return NextResponse.json(
      {
        error: err.message,
        fieldErrors: err.fieldErrors,
        detail: formatFieldErrors(err.fieldErrors) || err.detail,
      },
      { status: err.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data, { status: 201 });
}
