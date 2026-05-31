import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Booking, PaginatedResponse } from "@/types/api";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.get<PaginatedResponse<Booking>>("bookings/"),
  });
}
