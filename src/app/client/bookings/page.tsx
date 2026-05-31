"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { useCancelBooking } from "@/hooks/useCancelBooking";
import { useMyBookings } from "@/hooks/useMyBookings";
import {
  activeServiceIds,
  bookingPersonLabel,
  bookingServiceName,
} from "@/lib/booking-display";
import { BookingDetailModal } from "@/components/booking/BookingDetailModal";
import type { Booking } from "@/types/api";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type Tab = "upcoming" | "history";

export default function ClientBookingsPage() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailPreview, setDetailPreview] = useState<Booking | null>(null);

  const { data, isLoading, error } = useMyBookings();
  const cancelMutation = useCancelBooking();

  const bookings = useMemo(() => data?.results ?? [], [data]);
  const upcoming = bookings.filter((b) => b.status === "booked");
  const history = bookings.filter((b) => b.status !== "booked");
  const activeIds = useMemo(() => activeServiceIds(bookings), [bookings]);

  const openDetail = (booking: Booking) => {
    setDetailPreview(booking);
    setDetailId(booking.id);
  };

  if (isLoading) return <Spinner label="Loading bookings…" />;
  if (error) {
    return (
      <EmptyState
        title="Could not load bookings"
        description={error instanceof Error ? error.message : undefined}
      />
    );
  }

  const list = tab === "upcoming" ? upcoming : history;

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">My bookings</h2>
        <p className="text-stone-600">Your upcoming and past appointments.</p>
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-stone-100 p-1">
        {(["upcoming", "history"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={clsx(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              tab === value
                ? "bg-white text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-700",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        tab === "upcoming" ? (
          <div className="space-y-4">
            <EmptyState
              title="No upcoming appointments"
              description="Book a service to get started."
            />
            <Link href="/client/providers" className="inline-block">
              <Button>Browse services</Button>
            </Link>
          </div>
        ) : (
          <EmptyState title="No past appointments" />
        )
      ) : (
        <ul className="space-y-4">
          {list.map((b) => (
            <li key={b.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-stone-900">
                    {bookingServiceName(b.service)}
                  </p>
                  <p className="text-sm text-stone-600">
                    with {bookingPersonLabel(b.provider)}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatDateTime(b.start_time)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={b.status} />
                  <Button size="sm" variant="secondary" onClick={() => openDetail(b)}>
                    Details
                  </Button>
                  {b.status === "booked" && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={
                        cancelMutation.isPending &&
                        cancelMutation.variables === b.id
                      }
                      onClick={() => cancelMutation.mutate(b.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {b.status === "cancelled" &&
                    !activeIds.has(b.service?.id) && (
                      <Link href="/client/providers">
                        <Button size="sm">Book again</Button>
                      </Link>
                    )}
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
        role="client"
        preview={detailPreview}
      />
    </>
  );
}
