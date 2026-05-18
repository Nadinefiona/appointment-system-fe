import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ServiceProvider } from "@/types/api";

export function useProviderProfile() {
  return useQuery({
    queryKey: ["provider-profile"],
    queryFn: () => api.get<ServiceProvider>("me/provider-profile/"),
  });
}
