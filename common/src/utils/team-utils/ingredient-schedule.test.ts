import { describe, expect, it } from 'vitest';
import { FANCY_APPLE } from '../../types/ingredient/ingredients';
import type { TeamScheduleShift } from '../../types/team/team';
import {
  orderIngredientSchedule,
  validateIngredientSchedule,
  validateIngredientThresholds
} from './ingredient-schedule';
import { isConditionalSchedule, withScheduleTarget } from './conditional-schedule';

const threshold = { name: FANCY_APPLE.name, minimum: 10, maximum: 20 };
const producer: TeamScheduleShift = {
  slotIndex: 0,
  externalId: 'producer',
  startTime: '06:00',
  type: 'ingredients',
  ingredientThresholds: [threshold]
};
const alternate: TeamScheduleShift = { ...producer, externalId: 'alternate', ingredientThresholds: [] };

describe('ingredient schedule validation', () => {
  it('accepts zero minimums and equal bounds', () => {
    expect(validateIngredientThresholds([{ ...threshold, minimum: 0 }])).toBe('');
    expect(validateIngredientThresholds([{ ...threshold, minimum: 20 }])).toBe('');
  });
  it.each([
    { minimum: -1 },
    { minimum: 0.5 },
    { minimum: NaN },
    { maximum: Infinity },
    { maximum: 9 },
    { maximum: 0 },
    { name: 'unknown' }
  ])('rejects invalid thresholds %j', (override) => {
    expect(validateIngredientThresholds([{ ...threshold, ...override }])).not.toBe('');
  });
  it('rejects duplicate ingredients', () => {
    expect(validateIngredientThresholds([threshold, threshold])).not.toBe('');
  });
  it('supports more than two producers and keeps the alternate last', () => {
    const ordered = orderIngredientSchedule([alternate, producer, producer, producer]);
    expect(ordered).toEqual([producer, producer, producer, alternate]);
    expect(validateIngredientSchedule(ordered)).toBe('');
    expect(validateIngredientSchedule([producer, producer])).toBe('');
  });
  it('rejects multiple alternates, misplaced alternates, and mixed schedule types', () => {
    expect(validateIngredientSchedule([producer, alternate, alternate])).not.toBe('');
    expect(validateIngredientSchedule([alternate, producer])).not.toBe('');
    expect(validateIngredientSchedule([producer, { ...alternate, type: 'time' }])).not.toBe('');
  });
  it('treats ingredients as conditional and clears ingredient settings when changing type', () => {
    expect(isConditionalSchedule('ingredients')).toBe(true);
    expect(withScheduleTarget(producer, 'time')).toEqual({
      slotIndex: 0,
      externalId: 'producer',
      startTime: '06:00',
      type: 'time'
    });
  });
});
