import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { providerLabel } from "@/lib/display";
import type { PaginatedResponse, ServiceProvider } from "@/types/api";

export function useProviderDirectory() {
  const providersQuery = useQuery({
    queryKey: ["providers"],
    queryFn: () => api.get<PaginatedResponse<ServiceProvider>>("providers/"),
  });

  const providers = providersQuery.data?.results ?? [];

  const providerOptions = useMemo(
    () =>
      providers.map((p) => ({
        value: p.id,
        label: providerLabel(p),
      })),
    [providers],
  );

  const labelForProviderId = (id: string) => {
    const p = providers.find((x) => x.id === id);
    return p ? providerLabel(p) : "Provider";
  };

  return {
    providers,
    providerOptions,
    labelForProviderId,
    isLoading: providersQuery.isLoading,
    error: providersQuery.error,
  };
}
