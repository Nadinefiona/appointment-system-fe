"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { BookServiceModal } from "@/components/booking/BookServiceModal";
import { useProviderDirectory } from "@/hooks/useProviderDirectory";
import { useMyBookings } from "@/hooks/useMyBookings";
import { activeServiceIds } from "@/lib/booking-display";
import { providerLabel } from "@/lib/display";
import type { PaginatedResponse, ServiceProvider, ServiceType } from "@/types/api";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProviderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [bookingService, setBookingService] = useState<ServiceType | null>(null);
  const { providers } = useProviderDirectory();

  const providerQuery = useQuery({
    queryKey: ["provider", id],
    queryFn: () => api.get<ServiceProvider>(`providers/${id}/`),
  });

  const servicesQuery = useQuery({
    queryKey: ["services", id],
    queryFn: () =>
      api.get<PaginatedResponse<ServiceType>>("services/", { provider: id }),
  });

  const { data: bookingsData } = useMyBookings();
  const activeIds = useMemo(
    () => activeServiceIds(bookingsData?.results ?? []),
    [bookingsData],
  );

  if (providerQuery.isLoading) return <Spinner />;

  const provider = providerQuery.data;
  const providerRecord = providers.find((p) => p.id === id) ?? provider ?? null;
  const displayName = providerRecord ? providerLabel(providerRecord) : "Provider";

  const services = (servicesQuery.data?.results ?? []).filter((s) =>
    s.providers.includes(id),
  );

  return (
    <>
      <Link
        href="/client/providers"
        className="mb-4 inline-block text-sm font-medium text-brand-700 hover:underline"
      >
        ← All services
      </Link>

      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">{displayName}</h2>
        <p className="text-stone-600">{provider?.bio || "No bio provided."}</p>
      </div>

      <h3 className="mb-4 font-medium text-stone-900">Services</h3>
      {servicesQuery.isLoading ? (
        <Spinner label="Loading services…" />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services"
          description="This provider has no services listed."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => {
            const alreadyBooked = activeIds.has(service.id);
            return (
              <li key={service.id}>
                <Card className="flex flex-col justify-between gap-4">
                  <p className="font-medium text-stone-900">{service.name}</p>
                  <Button
                    disabled={alreadyBooked}
                    onClick={() => setBookingService(service)}
                  >
                    {alreadyBooked ? "Already booked" : "Book"}
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
        defaultProviderId={id}
      />
    </>
  );
}
