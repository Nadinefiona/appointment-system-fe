"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import type { ScheduleResponse } from "@/types/api";
import { useProviderProfile } from "@/hooks/useProviderProfile";
import { format, addDays } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/utils";
import { WEEKDAYS } from "@/lib/constants";

export default function ProviderSchedulePage() {
  const { data: profile, isLoading: profileLoading } = useProviderProfile();
  const [from, setFrom] = useState(format(new Date(), "yyyy-MM-dd"));
  const [to, setTo] = useState(format(addDays(new Date(), 7), "yyyy-MM-dd"));

  const fromIso = new Date(`${from}T00:00:00`).toISOString();
  const toIso = new Date(`${to}T23:59:59`).toISOString();

  const { data, isLoading } = useQuery({
    queryKey: ["schedule", profile?.id, from, to],
    queryFn: () =>
      api.get<ScheduleResponse>(`providers/${profile!.id}/schedule/`, {
        from: fromIso,
        to: toIso,
      }),
    enabled: Boolean(profile?.id),
  });

  if (profileLoading) return <Spinner />;

  return (
    <>
      <h2 className="mb-6 font-display text-2xl text-stone-900">Schedule</h2>
      <Card className="mb-6 grid gap-4 sm:grid-cols-2">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </Card>
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="mb-3 font-medium">Availability rules</h3>
            <ul className="space-y-2 text-sm">
              {(data?.availability ?? []).map((a) => (
                <li key={a.id} className="text-stone-600">
                  {WEEKDAYS[a.weekday]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                </li>
              ))}
              {(data?.availability ?? []).length === 0 && (
                <li className="text-stone-500">No rules in range</li>
              )}
            </ul>
          </Card>
          <Card>
            <h3 className="mb-3 font-medium">Bookings</h3>
            <ul className="space-y-2 text-sm">
              {(data?.bookings ?? []).map((b) => (
                <li key={b.id} className="flex justify-between gap-2">
                  <span>{formatDateTime(b.start_time)}</span>
                  <span className="capitalize text-stone-500">{b.status}</span>
                </li>
              ))}
              {(data?.bookings ?? []).length === 0 && (
                <li className="text-stone-500">No bookings in range</li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
