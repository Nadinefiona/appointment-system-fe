export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  detail: string | null;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string[]> = {},
    detail: string | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.detail = detail;
  }
}

function normalizeFieldErrors(
  body: Record<string, unknown>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail") continue;
    if (Array.isArray(value)) {
      errors[key] = value.map(String);
    } else if (typeof value === "string") {
      errors[key] = [value];
    }
  }
  return errors;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const detail =
    typeof body.detail === "string"
      ? body.detail
      : Array.isArray(body.detail)
        ? body.detail.map(String).join(" ")
        : null;

  const fieldErrors = normalizeFieldErrors(body);
  const fieldMessage = Object.values(fieldErrors).flat().join(" ");
  const message =
    detail ?? fieldMessage ?? response.statusText ?? "Request failed";

  return new ApiError(response.status, message, fieldErrors, detail);
}

export function formatFieldErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
    .join("; ");
}
