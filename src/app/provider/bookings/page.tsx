"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { Booking, PaginatedResponse } from "@/types/api";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProviderBookingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => api.get<PaginatedResponse<Booking>>("bookings/"),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`bookings/${id}/cancel/`),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bookings = data?.results ?? [];

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Bookings</h2>
      {isLoading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{formatDateTime(b.start_time)}</p>
                  <p className="text-sm text-stone-500">Client {b.client.slice(0, 8)}…</p>
                </div>
                <span className="flex items-center gap-2">
                  <Badge status={b.status} />
                  {b.status === "booked" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => cancelMutation.mutate(b.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
