import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { MeProfile } from "@/types/api";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get<MeProfile>("me/"),
  });
}
