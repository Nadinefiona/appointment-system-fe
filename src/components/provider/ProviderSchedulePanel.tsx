"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { api } from "@/lib/api/client";
import { useProviderProfile } from "@/hooks/useProviderProfile";
import type { ScheduleResponse } from "@/types/api";
import { WEEKDAYS } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";

export function ProviderSchedulePanel() {
  const { data: profile } = useProviderProfile();
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

  return (
    <section className="mt-12 border-t border-stone-200 pt-10">
      <h3 className="font-display text-xl text-stone-900">Calendar overview</h3>
      <p className="mt-1 text-sm text-stone-600">
        See your weekly hours and booked appointments for a date range.
      </p>

      <Card className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input label="From" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input label="To" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </Card>

      {isLoading ? (
        <div className="mt-6">
          <Spinner />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card>
            <h4 className="mb-3 font-medium text-stone-900">Weekly hours</h4>
            <ul className="space-y-2 text-sm">
              {(data?.availability ?? []).map((a) => (
                <li key={a.id} className="text-stone-600">
                  {WEEKDAYS[a.weekday]} {a.start_time.slice(0, 5)}–{a.end_time.slice(0, 5)}
                </li>
              ))}
              {(data?.availability ?? []).length === 0 && (
                <li className="text-stone-500">Nothing in this range</li>
              )}
            </ul>
          </Card>
          <Card>
            <h4 className="mb-3 font-medium text-stone-900">Appointments</h4>
            <ul className="space-y-2 text-sm">
              {(data?.bookings ?? []).map((b) => (
                <li key={b.id} className="flex justify-between gap-2">
                  <span>{formatDateTime(b.start_time)}</span>
                  <span className="capitalize text-stone-500">{b.status}</span>
                </li>
              ))}
              {(data?.bookings ?? []).length === 0 && (
                <li className="text-stone-500">No appointments in this range</li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
}
