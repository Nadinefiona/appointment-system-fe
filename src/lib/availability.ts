import type { AvailabilitySlot } from "@/types/api";
import { WEEKDAYS } from "@/lib/constants";

/** Normalize API or input time to minutes since midnight. */
export function timeToMinutes(time: string): number {
  const parts = time.trim().slice(0, 8).split(":");
  const hours = Number(parts[0] ?? 0);
  const minutes = Number(parts[1] ?? 0);
  return hours * 60 + minutes;
}

/** Format for API: HH:MM:SS */
export function toApiTime(hhmm: string): string {
  return hhmm.length === 5 ? `${hhmm}:00` : hhmm;
}

/** Format for time input: HH:MM */
export function toInputTime(apiTime: string): string {
  return apiTime.slice(0, 5);
}

/** True if [startA, endA) overlaps [startB, endB) (half-open intervals). */
export function rangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string,
): boolean {
  const a0 = timeToMinutes(startA);
  const a1 = timeToMinutes(endA);
  const b0 = timeToMinutes(startB);
  const b1 = timeToMinutes(endB);
  if (a0 >= a1 || b0 >= b1) return true;
  return a0 < b1 && b0 < a1;
}

export function findOverlappingSlot(
  slots: AvailabilitySlot[],
  weekday: number,
  startTime: string,
  endTime: string,
  excludeId?: string,
): AvailabilitySlot | undefined {
  const start = toApiTime(startTime);
  const end = toApiTime(endTime);

  if (timeToMinutes(start) >= timeToMinutes(end)) {
    return undefined;
  }

  return slots.find(
    (slot) =>
      slot.weekday === weekday &&
      slot.id !== excludeId &&
      rangesOverlap(start, end, slot.start_time, slot.end_time),
  );
}

export function overlapErrorMessage(
  slot: AvailabilitySlot,
  weekday: number,
): string {
  const day = WEEKDAYS[weekday] ?? `Day ${weekday}`;
  return `Overlaps existing ${day} slot (${toInputTime(slot.start_time)}–${toInputTime(slot.end_time)}). Choose a non-overlapping time.`;
}

export function slotsOnWeekday(
  slots: AvailabilitySlot[],
  weekday: number,
): AvailabilitySlot[] {
  return slots
    .filter((s) => s.weekday === weekday)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
}

const DAY_START_MINUTES = 0;
const DAY_END_MINUTES = 23 * 60 + 45;
const STEP_MINUTES = 15;

function minutesToHhmm(minutes: number): string {
  const capped = Math.min(minutes, 23 * 60 + 59);
  const h = Math.floor(capped / 60)
    .toString()
    .padStart(2, "0");
  const m = (capped % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** True if a point in time falls inside an existing slot (start inclusive, end exclusive). */
export function isMinuteInsideSlot(
  minute: number,
  slot: AvailabilitySlot,
): boolean {
  const start = timeToMinutes(slot.start_time);
  const end = timeToMinutes(slot.end_time);
  return minute >= start && minute < end;
}

function bookedSlots(
  slots: AvailabilitySlot[],
  weekday: number,
  excludeId?: string,
): AvailabilitySlot[] {
  return slotsOnWeekday(slots, weekday).filter((s) => s.id !== excludeId);
}

/** Start times that are not inside an existing slot. */
export function getStartTimeOptions(
  slots: AvailabilitySlot[],
  weekday: number,
  excludeId?: string,
): { value: string; label: string }[] {
  const booked = bookedSlots(slots, weekday, excludeId);
  const options: { value: string; label: string }[] = [];

  for (let m = DAY_START_MINUTES; m <= DAY_END_MINUTES; m += STEP_MINUTES) {
    const inside = booked.some((slot) => isMinuteInsideSlot(m, slot));
    if (!inside) {
      const value = minutesToHhmm(m);
      options.push({ value, label: value });
    }
  }

  return options;
}

/** End times after `startTime` where [start, end) does not overlap existing slots. */
export function getEndTimeOptions(
  slots: AvailabilitySlot[],
  weekday: number,
  startTime: string,
  excludeId?: string,
): { value: string; label: string }[] {
  const booked = bookedSlots(slots, weekday, excludeId);
  const startM = timeToMinutes(toApiTime(startTime));
  const options: { value: string; label: string }[] = [];

  for (let m = startM + STEP_MINUTES; m <= 24 * 60; m += STEP_MINUTES) {
    const endTime = minutesToHhmm(m);
    const overlap = booked.some((slot) =>
      rangesOverlap(
        toApiTime(startTime),
        toApiTime(endTime),
        slot.start_time,
        slot.end_time,
      ),
    );
    if (!overlap) {
      options.push({ value: endTime, label: endTime });
    }
  }

  return options;
}

export function pickValidTime(
  current: string,
  options: { value: string }[],
  fallback: string,
): string {
  if (options.some((o) => o.value === current)) return current;
  return options[0]?.value ?? fallback;
}
