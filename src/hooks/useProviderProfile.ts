import { useMe } from "@/hooks/useMe";
import type { ProviderProfile } from "@/types/api";

/** Provider record from nested `provider_profile` on GET /api/me/ */
export function useProviderProfile() {
  const query = useMe();
  return {
    ...query,
    data: query.data?.provider_profile ?? null,
  } as Omit<typeof query, "data"> & { data: ProviderProfile | null };
}
