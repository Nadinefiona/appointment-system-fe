"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type {
  OpeningsResponse,
  PaginatedResponse,
  ServiceProvider,
  ServiceType,
} from "@/types/api";
import { todayIsoDate } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { formatTime } from "@/lib/utils";

export default function ProviderBookingPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [date, setDate] = useState(todayIsoDate());
  const [serviceId, setServiceId] = useState("");
  const [selectedStart, setSelectedStart] = useState<string | null>(null);

  const providerQuery = useQuery({
    queryKey: ["provider", id],
    queryFn: () => api.get<ServiceProvider>(`providers/${id}/`),
  });

  const servicesQuery = useQuery({
    queryKey: ["services", id],
    queryFn: () =>
      api.get<PaginatedResponse<ServiceType>>("services/", { provider: id }),
  });

  const openingsQuery = useQuery({
    queryKey: ["openings", id, date, serviceId],
    queryFn: () =>
      api.get<OpeningsResponse>(`providers/${id}/openings/`, {
        date,
        service: serviceId || undefined,
      }),
    enabled: Boolean(id && date),
  });

  const services = servicesQuery.data?.results ?? [];
  const selectedService = services.find((s) => s.id === serviceId);

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!selectedStart || !serviceId) throw new Error("Pick a time and service");
      const start = new Date(selectedStart);
      const end = new Date(start);
      end.setMinutes(end.getMinutes() + (selectedService?.duration ?? 30));
      return api.post("bookings/", {
        provider: id,
        service: serviceId,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success("Appointment booked");
      setSelectedStart(null);
      qc.invalidateQueries({ queryKey: ["openings", id] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (providerQuery.isLoading) return <Spinner />;

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display text-2xl text-stone-900">Book appointment</h2>
        <p className="text-stone-600">
          {providerQuery.data?.bio || "Provider profile"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h3 className="font-medium text-stone-900">1. Choose service</h3>
          {servicesQuery.isLoading ? (
            <Spinner label="Loading services…" />
          ) : services.length === 0 ? (
            <p className="text-sm text-stone-500">No services listed.</p>
          ) : (
            <Select
              label="Service"
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setSelectedStart(null);
              }}
              options={[
                { value: "", label: "Select a service…" },
                ...services.map((s) => ({
                  value: s.id,
                  label: `${s.name} · ${s.duration} min · $${s.price}`,
                })),
              ]}
            />
          )}
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedStart(null);
            }}
          />
        </Card>

        <Card className="space-y-4">
          <h3 className="font-medium text-stone-900">2. Pick a time</h3>
          {openingsQuery.isLoading && <Spinner label="Loading openings…" />}
          {openingsQuery.error && (
            <p className="text-sm text-red-600">
              {(openingsQuery.error as Error).message}
            </p>
          )}
          {openingsQuery.data && (
            <>
              {!serviceId && (
                <p className="text-sm text-stone-500">
                  Select a service to see suggested start times.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {(openingsQuery.data.suggested_starts.length > 0
                  ? openingsQuery.data.suggested_starts
                  : []
                ).map((start) => (
                  <button
                    key={start}
                    type="button"
                    onClick={() => setSelectedStart(start)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                      selectedStart === start
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-stone-300 hover:border-brand-600"
                    }`}
                  >
                    {formatTime(start)}
                  </button>
                ))}
              </div>
              {serviceId &&
                openingsQuery.data.suggested_starts.length === 0 && (
                  <p className="text-sm text-stone-500">
                    No openings on this date. Try another day.
                  </p>
                )}
            </>
          )}
          <Button
            className="w-full"
            disabled={!selectedStart || !serviceId}
            loading={bookMutation.isPending}
            onClick={() => bookMutation.mutate()}
          >
            Confirm booking
          </Button>
        </Card>
      </div>
    </>
  );
}
