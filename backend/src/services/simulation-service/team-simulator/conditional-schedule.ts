import {
  getScheduleTarget,
  getConditionalScheduleDefinition,
  isConditionalSchedule,
  type ConditionalScheduleType,
  type Berry,
  type TeamScheduleShift
} from 'sleepapi-common';
import type { CookingState } from './cooking-state/cooking-state.js';

import type { BerryZoneState } from './berry-zone-state.js';

interface RotationBonusContext {
  cookingState?: CookingState;
  berryZoneState?: BerryZoneState;
  primaryBerry?: Berry;
  sunday: boolean;
}

// Each bonus supplies its own reader. A future non-cooking bonus can extend this
// context without being gated on the existence of cookingState.
const bonusReaders: Record<ConditionalScheduleType, (context: RotationBonusContext) => number | undefined> = {
  'berry-zone': ({ berryZoneState, primaryBerry }) =>
    primaryBerry ? berryZoneState?.bonusPercentage(primaryBerry) : undefined,
  'tasty-chance': ({ cookingState }) => cookingState?.extraTastyChancePercentage(),
  'pot-size': ({ cookingState, sunday }) => cookingState?.currentPotSize(sunday)
};

export function scheduleTargetReached(shift: TeamScheduleShift, context: RotationBonusContext): boolean {
  if (!isConditionalSchedule(shift.type)) return false;
  const target = getScheduleTarget(shift);
  const bonus = bonusReaders[shift.type](context);
  return (
    target !== undefined &&
    bonus !== undefined &&
    bonus >= Math.min(target, getConditionalScheduleDefinition(shift.type)?.maximumTarget ?? Infinity)
  );
}
