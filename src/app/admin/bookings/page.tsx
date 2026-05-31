"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { useCancelBooking } from "@/hooks/useCancelBooking";
import {
  bookingAdminLine,
  bookingServiceName,
} from "@/lib/booking-display";
import { BookingDetailModal } from "@/components/booking/BookingDetailModal";
import type { Booking, PaginatedResponse } from "@/types/api";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdminBookingsPage() {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailPreview, setDetailPreview] = useState<Booking | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "admin"],
    queryFn: () => api.get<PaginatedResponse<Booking>>("bookings/"),
  });

  const cancelMutation = useCancelBooking();

  const bookings = data?.results ?? [];

  const openDetail = (booking: Booking) => {
    setDetailPreview(booking);
    setDetailId(booking.id);
  };

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">All bookings</h2>
      {isLoading ? (
        <Spinner />
      ) : bookings.length === 0 ? (
        <EmptyState title="No bookings" />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{formatDateTime(b.start_time)}</p>
                  <p className="text-sm font-medium text-stone-800">
                    {bookingServiceName(b.service)}
                  </p>
                  <p className="text-sm text-stone-500">{bookingAdminLine(b)}</p>
                </div>
                <span className="flex flex-wrap items-center gap-2">
                  <Badge status={b.status} />
                  <Button size="sm" variant="secondary" onClick={() => openDetail(b)}>
                    Details
                  </Button>
                  {b.status === "booked" && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={
                        cancelMutation.isPending &&
                        cancelMutation.variables === b.id
                      }
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

      <BookingDetailModal
        bookingId={detailId}
        open={Boolean(detailId)}
        onClose={() => {
          setDetailId(null);
          setDetailPreview(null);
        }}
        role="admin"
        preview={detailPreview}
      />
    </>
  );
}
