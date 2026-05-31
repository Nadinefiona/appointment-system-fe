/** Django origin without `/api` suffix (paths in code include `/api/...`). */
function normalizeApiBase(url: string): string {
  return url.replace(/\/api\/?$/, "").replace(/\/$/, "");
}

export const API_BASE = normalizeApiBase(
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000",
);

export const COOKIE_ACCESS = "abs_access";
export const COOKIE_REFRESH = "abs_refresh";
export const COOKIE_USER = "abs_user";

export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const ROLE_HOME: Record<string, string> = {
  client: "/client/providers",
  provider: "/provider/dashboard",
  admin: "/admin/providers",
};
