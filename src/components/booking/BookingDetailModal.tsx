"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import {
  bookingAdminLine,
  bookingPersonLabel,
  bookingServiceName,
  bookingSummaryLine,
} from "@/lib/booking-display";
import type { Booking } from "@/types/api";
import { formatDateTime } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

type ViewerRole = "client" | "provider" | "admin";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-stone-900">{value}</dd>
    </div>
  );
}

export function BookingDetailModal({
  bookingId,
  open,
  onClose,
  role,
  preview,
}: {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
  role: ViewerRole;
  preview?: Booking | null;
}) {
  const detailQuery = useQuery({
    queryKey: ["booking", bookingId],
    queryFn: () => api.get<Booking>(`bookings/${bookingId}/`),
    enabled: Boolean(open && bookingId),
  });

  const booking = detailQuery.data ?? preview;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={booking ? bookingServiceName(booking.service) : "Booking details"}
    >
      {detailQuery.isLoading && !booking ? (
        <Spinner label="Loading details…" />
      ) : !booking ? (
        <p className="text-sm text-stone-600">Could not load this booking.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge status={booking.status} />
            <span className="text-sm text-stone-600">
              {formatDateTime(booking.start_time)}
            </span>
          </div>

          <dl className="grid gap-3">
            <DetailRow label="Service" value={bookingServiceName(booking.service)} />
            <DetailRow
              label="Starts"
              value={formatDateTime(booking.start_time)}
            />
            <DetailRow label="Ends" value={formatDateTime(booking.end_time)} />
            {role !== "client" && (
              <DetailRow label="Client" value={bookingPersonLabel(booking.client)} />
            )}
            {role !== "provider" && (
              <DetailRow
                label="Provider"
                value={bookingPersonLabel(booking.provider)}
              />
            )}
            {role === "admin" && (
              <DetailRow label="Summary" value={bookingAdminLine(booking)} />
            )}
            {role === "client" && (
              <DetailRow label="With" value={bookingSummaryLine(booking)} />
            )}
            {booking.note?.trim() && (
              <DetailRow label="Note" value={booking.note.trim()} />
            )}
          </dl>

          <Button variant="secondary" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
}
