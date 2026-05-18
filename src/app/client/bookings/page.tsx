"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { Booking, PaginatedResponse } from "@/types/api";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function ClientBookingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
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

  if (isLoading) return <Spinner label="Loading bookings…" />;
  if (error) {
    return (
      <EmptyState
        title="Could not load bookings"
        description={error instanceof Error ? error.message : undefined}
      />
    );
  }

  const bookings = data?.results ?? [];

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">My bookings</h2>
        <p className="text-stone-600">View and manage your appointments.</p>
      </div>
      {bookings.length === 0 ? (
        <EmptyState title="No bookings yet" description="Book a provider to get started." />
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-stone-900">
                    {formatDateTime(b.start_time)}
                  </p>
                  <p className="text-sm text-stone-500">
                    Until {formatDateTime(b.end_time)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={b.status} />
                  {b.status === "booked" && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(b.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
