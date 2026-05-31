import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

export function useCancelBooking() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.post(`bookings/${id}/cancel/`),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["openings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
