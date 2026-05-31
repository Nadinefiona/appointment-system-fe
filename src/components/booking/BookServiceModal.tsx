"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { providerDetailLabel, providerDetailOptions } from "@/lib/display";
import { formatTime } from "@/lib/utils";
import type { CreateBookingPayload, OpeningsResponse, ServiceType } from "@/types/api";
import { todayIsoDate } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const BOOKING_DURATION_MINUTES = 60;

function openingsTimeOptions(data: OpeningsResponse | undefined) {
  if (!data) return [];
  if (data.available_times?.length) return data.available_times;
  return (data.suggested_starts ?? []).map((value) => ({
    value,
    label: formatTime(value),
  }));
}

export function BookServiceModal({
  service,
  open,
  onClose,
  defaultProviderId,
}: {
  service: ServiceType | null;
  open: boolean;
  onClose: () => void;
  defaultProviderId?: string;
}) {
  const qc = useQueryClient();
  const providerOptions = useMemo(
    () => (service ? providerDetailOptions(service.provider_details ?? []) : []),
    [service],
  );

  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState(todayIsoDate());
  const [selectedStart, setSelectedStart] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !service) return;
    const allowed = new Set(service.providers ?? []);
    const preferred =
      defaultProviderId && allowed.has(defaultProviderId)
        ? defaultProviderId
        : providerOptions[0]?.value ?? "";
    setProviderId(preferred);
    setDate(todayIsoDate());
    setSelectedStart("");
    setNote("");
  }, [open, service, defaultProviderId, providerOptions]);

  const openingsQuery = useQuery({
    queryKey: ["openings", providerId, date, service?.id, BOOKING_DURATION_MINUTES],
    queryFn: () =>
      api.get<OpeningsResponse>(`providers/${providerId}/openings/`, {
        date,
        service: service!.id,
        duration: BOOKING_DURATION_MINUTES,
      }),
    enabled: Boolean(open && service && providerId && date),
    staleTime: 0,
  });

  const timeOptions = useMemo(
    () => openingsTimeOptions(openingsQuery.data),
    [openingsQuery.data],
  );

  useEffect(() => {
    if (!selectedStart) return;
    if (!timeOptions.some((t) => t.value === selectedStart)) {
      setSelectedStart("");
    }
  }, [timeOptions, selectedStart]);

  const bookMutation = useMutation({
    mutationFn: () => {
      if (!service || !providerId || !selectedStart) {
        throw new Error("Choose a provider, date, and time.");
      }
      if (!service.providers.includes(providerId)) {
        throw new Error("Selected provider is not available for this service.");
      }
      const body: CreateBookingPayload = {
        provider: providerId,
        service: service.id,
        start_time: selectedStart,
      };
      const trimmed = note.trim();
      if (trimmed) body.note = trimmed;
      return api.post("bookings/", body);
    },
    onSuccess: () => {
      toast.success("Appointment booked successfully");
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["openings"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!service) return null;

  const busy = bookMutation.isPending;
  const selectedProvider = service.provider_details.find((p) => p.id === providerId);

  const timeSelectOptions = [
    {
      value: "",
      label: openingsQuery.isLoading
        ? "Loading times…"
        : timeOptions.length
          ? "Select a time…"
          : "No times available",
    },
    ...timeOptions,
  ];

  return (
    <Modal open={open} onClose={onClose} title={`Book: ${service.name}`}>
      <div className="space-y-4">
        <p className="text-sm text-stone-600">
          Service: <span className="font-medium text-stone-900">{service.name}</span>
        </p>

        {providerOptions.length === 0 ? (
          <p className="text-sm text-amber-700">No providers are assigned to this service.</p>
        ) : (
          <Select
            label="Provider"
            value={providerId}
            disabled={busy}
            onChange={(e) => {
              setProviderId(e.target.value);
              setSelectedStart("");
            }}
            options={[
              { value: "", label: "Select a provider…" },
              ...providerOptions,
            ]}
          />
        )}

        {selectedProvider && (
          <p className="text-xs text-stone-500">
            Selected: {providerDetailLabel(selectedProvider)}
          </p>
        )}

        <Input
          label="Date"
          type="date"
          value={date}
          min={todayIsoDate()}
          disabled={busy}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedStart("");
          }}
        />

        {providerId && (
          <>
            {openingsQuery.isLoading && (
              <Spinner label="Loading available times…" />
            )}
            {openingsQuery.error && (
              <p className="text-sm text-red-600">
                {(openingsQuery.error as Error).message}
              </p>
            )}
            {!openingsQuery.isLoading && !openingsQuery.error && (
              <Select
                label="Available time"
                value={selectedStart}
                onChange={(e) => setSelectedStart(e.target.value)}
                disabled={busy || timeOptions.length === 0}
                options={timeSelectOptions}
              />
            )}
          </>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-stone-700">
            Note for provider{" "}
            <span className="font-normal text-stone-500">(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            disabled={busy}
            placeholder="Any message for the provider…"
            className="w-full border-0 border-b border-stone-300 bg-transparent px-0 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-brand-600 focus:outline-none disabled:opacity-60"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            className="flex-1"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={!providerId || !selectedStart || providerOptions.length === 0}
            loading={busy}
            onClick={() => bookMutation.mutate()}
          >
            Confirm booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}
