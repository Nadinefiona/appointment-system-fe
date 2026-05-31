import type { ProviderDetail, ServiceProvider, UserRole } from "@/types/api";

export interface UserNameFields {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: UserRole;
}

export function formatPersonName(
  person?: UserNameFields | null,
  fallback = "Unknown",
): string {
  if (!person) return fallback;
  const name = [person.first_name, person.last_name].filter(Boolean).join(" ").trim();
  if (name && name.toLowerCase() !== "string") return name;
  if (person.email) return person.email;
  return fallback;
}

export function roleLabel(role: UserRole): string {
  if (role === "provider") return "Provider";
  if (role === "admin") return "Admin";
  return "Client";
}

export function providerDetailLabel(provider: ProviderDetail | UserNameFields): string {
  const name = [provider.first_name, provider.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  return provider.email ?? "Provider";
}

export function providerLabel(provider: ServiceProvider): string {
  const name = [provider.first_name, provider.last_name].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (provider.email) return provider.email;
  if (typeof provider.user === "object" && provider.user !== null) {
    return formatPersonName(provider.user, "Provider");
  }
  return "Provider";
}

export function formatProviderDetailsList(details: ProviderDetail[] | undefined): string {
  if (!details?.length) return "No providers assigned";
  return details.map((p) => providerDetailLabel(p)).join(", ");
}

export function providerDetailOptions(details: ProviderDetail[]) {
  return details.map((p) => ({
    value: p.id,
    label: providerDetailLabel(p),
  }));
}
