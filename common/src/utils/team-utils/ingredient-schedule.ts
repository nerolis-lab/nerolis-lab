import { INGREDIENTS } from '../../types/ingredient/ingredients';
import type { ScheduleIngredientThreshold, TeamScheduleShift } from '../../types/team/team';

export function validateIngredientThresholds(thresholds: ScheduleIngredientThreshold[]): string {
  const names = new Set<string>();
  for (const threshold of thresholds) {
    if (!INGREDIENTS.some((ingredient) => ingredient.name === threshold.name)) return 'Choose an ingredient.';
    if (names.has(threshold.name)) return 'Choose each ingredient only once per member.';
    names.add(threshold.name);
    if (!Number.isSafeInteger(threshold.minimum) || threshold.minimum < 0) {
      return 'Minimum amounts must be whole numbers of zero or more.';
    }
    if (!Number.isSafeInteger(threshold.maximum) || threshold.maximum < 1 || threshold.maximum < threshold.minimum) {
      return 'Maximum amounts must be positive whole numbers at least as large as the minimum.';
    }
  }
  return '';
}

/** Keep the optional alternate last without changing producer priority. */
export function orderIngredientSchedule(shifts: TeamScheduleShift[]): TeamScheduleShift[] {
  return [
    ...shifts.filter((shift) => shift.ingredientThresholds?.length),
    ...shifts.filter((shift) => !shift.ingredientThresholds?.length)
  ];
}

export function validateIngredientSchedule(shifts: TeamScheduleShift[]): string {
  const slots = new Map<number, TeamScheduleShift[]>();
  for (const shift of shifts) {
    const slot = slots.get(shift.slotIndex) ?? [];
    slot.push(shift);
    slots.set(shift.slotIndex, slot);
  }
  for (const slot of slots.values()) {
    if (!slot.some((shift) => shift.type === 'ingredients')) continue;
    if (slot.some((shift) => shift.type !== 'ingredients'))
      return 'Use the same rotation type for every member in a slot.';
    if (slot.filter((shift) => !shift.ingredientThresholds?.length).length > 1) {
      return 'An ingredient schedule can have only one alternate without ingredients.';
    }
    if (slot.slice(0, -1).some((shift) => !shift.ingredientThresholds?.length)) {
      return 'The alternate without ingredients must be last.';
    }
    for (const shift of slot) {
      const error = validateIngredientThresholds(shift.ingredientThresholds ?? []);
      if (error) return error;
    }
  }
  return '';
}
