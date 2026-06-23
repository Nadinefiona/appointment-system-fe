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

function collectMessages(value: unknown, acc: string[]): void {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) acc.push(trimmed);
  } else if (Array.isArray(value)) {
    for (const item of value) collectMessages(item, acc);
  } else if (typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectMessages(item, acc);
    }
  } else {
    acc.push(String(value));
  }
}

function normalizeFieldErrors(
  body: Record<string, unknown>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail") continue;
    const messages: string[] = [];
    collectMessages(value, messages);
    if (messages.length > 0) errors[key] = messages;
  }
  return errors;
}

export async function parseApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  const record =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};

  const detail =
    typeof record.detail === "string"
      ? record.detail
      : Array.isArray(record.detail)
        ? record.detail.map(String).join(" ")
        : null;

  const fieldErrors = normalizeFieldErrors(record);

  const allMessages: string[] = [];
  collectMessages(body, allMessages);

  const message =
    allMessages.join(" ") ||
    response.statusText ||
    `Request failed (${response.status})`;

  return new ApiError(response.status, message, fieldErrors, detail);
}

export function formatFieldErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
    .join("; ");
}
