import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { MeProfile } from "@/types/api";

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get<MeProfile[]>("admin/users/"),
  });
}
