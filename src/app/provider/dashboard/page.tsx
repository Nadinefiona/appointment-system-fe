"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  bookingPersonLabel,
  bookingServiceName,
} from "@/lib/booking-display";
import { BookingDetailModal } from "@/components/booking/BookingDetailModal";
import type { Booking, PaginatedResponse } from "@/types/api";
import { endOfTodayIso, formatDateTime, startOfTodayIso } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProviderDashboardPage() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailPreview, setDetailPreview] = useState<Booking | null>(null);

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

  const openDetail = (booking: Booking) => {
    setDetailPreview(booking);
    setDetailId(booking.id);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">Today</h2>
        <p className="text-stone-600">Upcoming appointments for today.</p>
      </div>
      {isLoading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState title="Nothing on the calendar today" />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{formatDateTime(b.start_time)}</p>
                  <p className="text-sm text-stone-600">
                    {bookingServiceName(b.service)} · {bookingPersonLabel(b.client)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={b.status} />
                  <Button size="sm" variant="secondary" onClick={() => openDetail(b)}>
                    View
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <BookingDetailModal
        bookingId={detailId}
        open={Boolean(detailId)}
        onClose={() => {
          setDetailId(null);
          setDetailPreview(null);
        }}
        role="provider"
        preview={detailPreview}
      />
    </>
  );
}
