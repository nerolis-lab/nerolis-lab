import type { TeamScheduleShift } from 'sleepapi-common';

/** Meet every minimum before topping up to maximums, preserving priority within each phase. */
export function advanceIngredientSchedule(shifts: TeamScheduleShift[], amount: (name: string) => number): number {
  for (const bound of ['minimum', 'maximum'] as const) {
    const next = shifts.findIndex((shift) =>
      shift.ingredientThresholds?.some((threshold) => amount(threshold.name) < threshold[bound])
    );
    if (next >= 0) return next;
  }
  const alternate = shifts.findIndex((shift) => !shift.ingredientThresholds?.length);
  return alternate >= 0 ? alternate : 0;
}
