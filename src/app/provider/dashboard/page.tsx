"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { Booking, PaginatedResponse } from "@/types/api";
import { endOfTodayIso, formatDateTime, startOfTodayIso } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProviderDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "today"],
    queryFn: () =>
      api.get<PaginatedResponse<Booking>>("bookings/", {
        from: startOfTodayIso(),
        to: endOfTodayIso(),
        status: "booked",
      }),
  });

  const bookings = data?.results ?? [];

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">Today</h2>
        <p className="text-stone-600">Upcoming appointments for today.</p>
      </div>
      {isLoading ? (
        <Spinner label="Loading schedule…" />
      ) : bookings.length === 0 ? (
        <EmptyState title="No appointments today" description="Enjoy your free day." />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{formatDateTime(b.start_time)}</p>
                  <p className="text-sm text-stone-500">Service {b.service.slice(0, 8)}…</p>
                </div>
                <Badge status={b.status} />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
