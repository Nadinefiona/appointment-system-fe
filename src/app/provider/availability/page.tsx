"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import {
  findOverlappingSlot,
  getEndTimeOptions,
  getStartTimeOptions,
  overlapErrorMessage,
  pickValidTime,
  slotsOnWeekday,
  toApiTime,
  toInputTime,
  timeToMinutes,
} from "@/lib/availability";
import type {
  AvailabilitySlot,
  CreateAvailabilityPayload,
  PaginatedResponse,
} from "@/types/api";
import { WEEKDAYS } from "@/lib/constants";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProviderSchedulePanel } from "@/components/provider/ProviderSchedulePanel";

function validateSlot(
  slots: AvailabilitySlot[],
  weekday: number,
  startTime: string,
  endTime: string,
  excludeId?: string,
): string | null {
  if (timeToMinutes(toApiTime(startTime)) >= timeToMinutes(toApiTime(endTime))) {
    return "End time must be after start time.";
  }
  const overlap = findOverlappingSlot(slots, weekday, startTime, endTime, excludeId);
  if (overlap) return overlapErrorMessage(overlap, weekday);
  return null;
}

export default function ProviderAvailabilityPage() {
  const qc = useQueryClient();
  const [weekday, setWeekday] = useState("0");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeekday, setEditWeekday] = useState("0");
  const [editStart, setEditStart] = useState("09:00");
  const [editEnd, setEditEnd] = useState("17:00");

  const { data, isLoading } = useQuery({
    queryKey: ["availability-slots"],
    queryFn: () =>
      api.get<PaginatedResponse<AvailabilitySlot>>("availability-slots/"),
  });

  const slots = data?.results ?? [];
  const weekdayNum = Number(weekday);
  const editWeekdayNum = Number(editWeekday);

  const addStartOptions = useMemo(
    () => getStartTimeOptions(slots, weekdayNum),
    [slots, weekdayNum],
  );
  const addEndOptions = useMemo(
    () => getEndTimeOptions(slots, weekdayNum, startTime),
    [slots, weekdayNum, startTime],
  );

  const editStartOptions = useMemo(
    () => getStartTimeOptions(slots, editWeekdayNum, editingId ?? undefined),
    [slots, editWeekdayNum, editingId],
  );
  const editEndOptions = useMemo(
    () =>
      getEndTimeOptions(
        slots,
        editWeekdayNum,
        editStart,
        editingId ?? undefined,
      ),
    [slots, editWeekdayNum, editStart, editingId],
  );

  const sameDaySlots = useMemo(
    () => slotsOnWeekday(slots, weekdayNum),
    [slots, weekdayNum],
  );

  useEffect(() => {
    setStartTime((cur) => pickValidTime(cur, addStartOptions, "09:00"));
  }, [weekdayNum, slots, addStartOptions]);

  useEffect(() => {
    setEndTime((cur) =>
      pickValidTime(cur, addEndOptions, "17:00"),
    );
  }, [weekdayNum, slots, startTime, addEndOptions]);

  useEffect(() => {
    if (!editingId) return;
    setEditStart((cur) => pickValidTime(cur, editStartOptions, "09:00"));
  }, [editingId, editWeekdayNum, slots, editStartOptions]);

  useEffect(() => {
    if (!editingId) return;
    setEditEnd((cur) => pickValidTime(cur, editEndOptions, "17:00"));
  }, [editingId, editWeekdayNum, editStart, slots, editEndOptions]);

  const createMutation = useMutation({
    mutationFn: (body: CreateAvailabilityPayload) =>
      api.post<AvailabilitySlot>("availability-slots/", body),
    onSuccess: () => {
      toast.success("Availability saved");
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: CreateAvailabilityPayload;
    }) => api.patch<AvailabilitySlot>(`availability-slots/${id}`, body),
    onSuccess: () => {
      toast.success("Availability updated");
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`availability-slots/${id}`),
    onSuccess: () => {
      toast.success("Availability removed");
      qc.invalidateQueries({ queryKey: ["availability-slots"] });
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleAdd = () => {
    if (addStartOptions.length === 0 || addEndOptions.length === 0) {
      toast.error("No free time left on this day. Pick another weekday.");
      return;
    }
    const error = validateSlot(slots, weekdayNum, startTime, endTime);
    if (error) {
      toast.error(error);
      return;
    }
    createMutation.mutate({
      weekday: weekdayNum,
      start_time: toApiTime(startTime),
      end_time: toApiTime(endTime),
    });
  };

  const startEdit = (slot: AvailabilitySlot) => {
    setEditingId(slot.id);
    setEditWeekday(String(slot.weekday));
    setEditStart(toInputTime(slot.start_time));
    setEditEnd(toInputTime(slot.end_time));
  };

  const handleSaveEdit = (id: string) => {
    if (editStartOptions.length === 0 || editEndOptions.length === 0) {
      toast.error("No valid time range for this day.");
      return;
    }
    const w = Number(editWeekday);
    const error = validateSlot(slots, w, editStart, editEnd, id);
    if (error) {
      toast.error(error);
      return;
    }
    updateMutation.mutate({
      id,
      body: {
        weekday: w,
        start_time: toApiTime(editStart),
        end_time: toApiTime(editEnd),
      },
    });
  };

  return (
    <>
      <h2 className="mb-2 font-display text-2xl text-stone-900">Availability</h2>
      <p className="mb-6 text-stone-600">
        Set when you are open each week. Overlapping times on the same day are not allowed.
      </p>

      <Card className="mb-8">
        <h3 className="mb-4 font-medium">Add slot</h3>
        {sameDaySlots.length > 0 && (
          <p className="mb-4 text-sm text-stone-600">
            Already on {WEEKDAYS[weekdayNum]}:{" "}
            {sameDaySlots
              .map(
                (s) =>
                  `${toInputTime(s.start_time)}–${toInputTime(s.end_time)}`,
              )
              .join(", ")}
          </p>
        )}
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <Select
            label="Weekday"
            value={weekday}
            disabled={createMutation.isPending}
            onChange={(e) => setWeekday(e.target.value)}
            options={WEEKDAYS.map((d, i) => ({ value: String(i), label: d }))}
          />
          <Select
            label="Start"
            value={startTime}
            onChange={(e) => {
              const next = e.target.value;
              setStartTime(next);
              setEndTime((prev) =>
                pickValidTime(
                  prev,
                  getEndTimeOptions(slots, weekdayNum, next),
                  prev,
                ),
              );
            }}
            options={
              addStartOptions.length > 0
                ? addStartOptions
                : [{ value: "", label: "No free start times" }]
            }
            disabled={createMutation.isPending || addStartOptions.length === 0}
          />
          <Select
            label="End"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            options={
              addEndOptions.length > 0
                ? addEndOptions
                : [{ value: "", label: "No free end times" }]
            }
            disabled={createMutation.isPending || addEndOptions.length === 0}
          />
          <div className="flex items-end">
            <Button
              type="submit"
              loading={createMutation.isPending}
              disabled={addStartOptions.length === 0 || addEndOptions.length === 0}
              className="w-full"
            >
              Add
            </Button>
          </div>
        </form>
      </Card>

      {isLoading ? (
        <Spinner />
      ) : slots.length === 0 ? (
        <EmptyState title="No availability yet" description="Add a time window above." />
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => {
            const isEditing = editingId === slot.id;
            const isDeleting =
              deleteMutation.isPending && deleteMutation.variables === slot.id;
            const isSaving =
              updateMutation.isPending &&
              updateMutation.variables?.id === slot.id;

            return (
              <li key={slot.id}>
                <Card className="space-y-4">
                  {isEditing ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Select
                        label="Weekday"
                        value={editWeekday}
                        disabled={isSaving}
                        onChange={(e) => setEditWeekday(e.target.value)}
                        options={WEEKDAYS.map((d, i) => ({
                          value: String(i),
                          label: d,
                        }))}
                      />
                      <Select
                        label="Start"
                        value={editStart}
                        onChange={(e) => {
                          const next = e.target.value;
                          setEditStart(next);
                          setEditEnd((prev) =>
                            pickValidTime(
                              prev,
                              getEndTimeOptions(
                                slots,
                                editWeekdayNum,
                                next,
                                slot.id,
                              ),
                              prev,
                            ),
                          );
                        }}
                        options={
                          editStartOptions.length > 0
                            ? editStartOptions
                            : [{ value: "", label: "No free start times" }]
                        }
                        disabled={isSaving || editStartOptions.length === 0}
                      />
                      <Select
                        label="End"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        options={
                          editEndOptions.length > 0
                            ? editEndOptions
                            : [{ value: "", label: "No free end times" }]
                        }
                        disabled={isSaving || editEndOptions.length === 0}
                      />
                      <div className="flex items-end gap-2">
                        <Button
                          className="flex-1"
                          loading={isSaving}
                          disabled={
                            editStartOptions.length === 0 ||
                            editEndOptions.length === 0
                          }
                          onClick={() => handleSaveEdit(slot.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex-1"
                          disabled={isSaving}
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium">{WEEKDAYS[slot.weekday]}</p>
                        <p className="text-sm text-stone-600">
                          {toInputTime(slot.start_time)} –{" "}
                          {toInputTime(slot.end_time)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => startEdit(slot)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => deleteMutation.mutate(slot.id)}
                          loading={isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ProviderSchedulePanel />
    </>
  );
}
