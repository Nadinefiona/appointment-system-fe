import { formatPersonName } from "@/lib/display";
import type { Booking, BookingPerson, BookingService } from "@/types/api";

export function bookingServiceName(service: BookingService): string {
  return service?.name ?? "Service";
}

export function bookingPersonLabel(person: BookingPerson): string {
  return formatPersonName(person, person.email ?? "Unknown");
}

export function bookingSummaryLine(booking: Booking): string {
  return `${bookingServiceName(booking.service)} · ${bookingPersonLabel(booking.provider)}`;
}

export function bookingAdminLine(booking: Booking): string {
  return `${bookingPersonLabel(booking.client)} · ${bookingPersonLabel(booking.provider)}`;
}

export function activeServiceIds(bookings: Booking[]): Set<string> {
  return new Set(
    bookings
      .filter((b) => b.status === "booked")
      .map((b) => b.service?.id)
      .filter(Boolean) as string[],
  );
}
