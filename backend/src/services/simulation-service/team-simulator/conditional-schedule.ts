import {
  getScheduleTarget,
  getConditionalScheduleDefinition,
  isConditionalSchedule,
  type BonusScheduleType,
  berry,
  type TeamScheduleShift
} from 'sleepapi-common';
import type { CookingState } from './cooking-state/cooking-state.js';

import type { BerryZoneState } from './berry-zone-state.js';

interface RotationBonusContext {
  cookingState?: CookingState;
  berryZoneState?: BerryZoneState;
  sunday: boolean;
}

// Each bonus supplies its own reader. A future non-cooking bonus can extend this
// context without being gated on the existence of cookingState.
const bonusReaders: Record<
  BonusScheduleType,
  (context: RotationBonusContext, shift: TeamScheduleShift) => number | undefined
> = {
  'berry-zone': ({ berryZoneState }, shift) => {
    const selectedBerry = berry.BERRIES.find((berry) => berry.name === shift.berryZoneBerry);
    return selectedBerry ? berryZoneState?.bonusPercentage(selectedBerry) : undefined;
  },
  'tasty-chance': ({ cookingState }) => cookingState?.extraTastyChancePercentage(),
  'pot-size': ({ cookingState, sunday }) => cookingState?.currentPotSize(sunday)
};

export function scheduleTargetReached(shift: TeamScheduleShift, context: RotationBonusContext): boolean {
  if (!isConditionalSchedule(shift.type) || shift.type === 'ingredients') return false;
  const target = getScheduleTarget(shift);
  const bonus = bonusReaders[shift.type](context, shift);
  return (
    target !== undefined &&
    bonus !== undefined &&
    bonus >= Math.min(target, getConditionalScheduleDefinition(shift.type)?.maximumTarget ?? Infinity)
  );
}
