"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { BookServiceModal } from "@/components/booking/BookServiceModal";
import { useMyBookings } from "@/hooks/useMyBookings";
import { activeServiceIds } from "@/lib/booking-display";
import { formatProviderDetailsList } from "@/lib/display";
import type { PaginatedResponse, ServiceType } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

export default function ClientProvidersPage() {
  const [bookingService, setBookingService] = useState<ServiceType | null>(null);

  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: () => api.get<PaginatedResponse<ServiceType>>("services/"),
  });

  const { data: bookingsData } = useMyBookings();
  const activeIds = useMemo(
    () => activeServiceIds(bookingsData?.results ?? []),
    [bookingsData],
  );

  if (servicesQuery.isLoading) return <Spinner label="Loading services…" />;
  if (servicesQuery.error) {
    return (
      <EmptyState
        title="Could not load services"
        description={
          servicesQuery.error instanceof Error
            ? servicesQuery.error.message
            : "Unknown error"
        }
      />
    );
  }

  const services = servicesQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-stone-900">Book a service</h2>
        <p className="text-stone-600">Pick a service, then choose who and when.</p>
      </div>

      {services.length === 0 ? (
        <EmptyState title="No services yet" description="Check back later." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const alreadyBooked = activeIds.has(service.id);
            const noProviders = !service.provider_details?.length;
            return (
              <li key={service.id}>
                <Card className="flex h-full flex-col justify-between gap-4">
                  <div>
                    <p className="font-display text-lg text-stone-900">
                      {service.name}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {formatProviderDetailsList(service.provider_details)}
                    </p>
                  </div>
                  <Button
                    className="w-full"
                    disabled={noProviders || alreadyBooked}
                    onClick={() => setBookingService(service)}
                  >
                    {alreadyBooked ? "Already booked" : "Book now"}
                  </Button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <BookServiceModal
        service={bookingService}
        open={Boolean(bookingService)}
        onClose={() => setBookingService(null)}
      />
    </div>
  );
}
