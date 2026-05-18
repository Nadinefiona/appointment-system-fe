"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import type { AvailabilitySlot, PaginatedResponse } from "@/types/api";
import { WEEKDAYS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProviderAvailabilityPage() {
  const qc = useQueryClient();
  const [weekday, setWeekday] = useState("0");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const { data, isLoading } = useQuery({
    queryKey: ["availability-slots"],
    queryFn: () =>
      api.get<PaginatedResponse<AvailabilitySlot>>("availability-slots/"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<AvailabilitySlot>("availability-slots/", {
        weekday: Number(weekday),
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      }),
    onSuccess: () => {
      toast.success("Slot added");
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`availability-slots/${id}/`),
    onSuccess: () => {
      toast.success("Slot removed");
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const slots = data?.results ?? [];

  return (
    <>
      <h2 className="mb-2 font-display text-2xl text-stone-900">Availability</h2>
      <p className="mb-6 text-stone-600">Weekly recurring time windows.</p>

      <Card className="mb-8">
        <h3 className="mb-4 font-medium">Add slot</h3>
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
        >
          <Select
            label="Weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            options={WEEKDAYS.map((d, i) => ({ value: String(i), label: d }))}
          />
          <Input
            label="Start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <Input
            label="End"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="submit" loading={createMutation.isPending} className="w-full">
              Add
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : slots.length === 0 ? (
        <EmptyState title="No slots yet" description="Add your first weekly window above." />
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => (
            <li key={slot.id}>
              <Card className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{WEEKDAYS[slot.weekday]}</p>
                  <p className="text-sm text-stone-600">
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => deleteMutation.mutate(slot.id)}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
