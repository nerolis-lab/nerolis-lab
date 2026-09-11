import type { Pokemon } from '../../types/pokemon/pokemon';
import { capitalize } from '../string-utils/string-utils';
import {
  CookingAssistSBulkUp,
  CookingPowerUpS,
  CookingPowerUpSMinus,
  TastyChanceS,
  Psystrike,
  type Mainskill
} from '../../types/mainskill';
import type { TeamScheduleShift, TeamScheduleType } from '../../types/team/team';

export type ConditionalScheduleType = Exclude<TeamScheduleType, 'time'>;

interface ConditionalScheduleDefinition {
  title: string;
  description: string | ((pokemon?: Pokemon) => string);
  targetLabel: string | ((pokemon?: Pokemon) => string);
  targetField: 'tastyChanceTarget' | 'potSizeTarget' | 'berryZoneTarget';
  defaultTarget: number;
  maximumTarget?: number;
  inputmode: 'decimal' | 'numeric';
  eligibleSkills: Mainskill[];
  requiresCooking: boolean;
  validateTarget: (target: number) => string;
}

/** Type-specific rules for the two-member, accumulate-then-return rotation policy.
 * Keep persisted target keys here so existing schedules do not need a migration.
 * Backend bonus readers are separately exhaustive over ConditionalScheduleType.
 */
export const conditionalScheduleDefinitions: Record<ConditionalScheduleType, ConditionalScheduleDefinition> = {
  'berry-zone': {
    title: 'Berry zone',
    description: (pokemon) =>
      `Rotate after the ${pokemon ? capitalize(pokemon.berry.type) + ' ' : ''}berry strength bonus reaches the target. The zone lasts until moving sites.`,
    targetLabel: (pokemon) => `${pokemon ? capitalize(pokemon.berry.type) + ' ' : ''}berry strength bonus %`,
    targetField: 'berryZoneTarget',
    defaultTarget: Psystrike.maximumBonus,
    maximumTarget: Psystrike.maximumBonus,
    inputmode: 'decimal',
    eligibleSkills: [Psystrike],
    requiresCooking: false,
    validateTarget: (target) => (target > Psystrike.maximumBonus ? 'Enter a bonus of 24% or less.' : '')
  },
  'tasty-chance': {
    title: 'Extra tasty chance',
    description: 'Rotate after accumulated Extra Tasty chance reaches the target.',
    targetLabel: 'Extra Tasty chance %',
    targetField: 'tastyChanceTarget',
    defaultTarget: 30,
    maximumTarget: 70,
    inputmode: 'decimal',
    eligibleSkills: [TastyChanceS, CookingAssistSBulkUp],
    requiresCooking: true,
    validateTarget: (target) => (target > 70 ? 'Enter a chance of 70% or less.' : '')
  },
  'pot-size': {
    title: 'Pot size',
    description: 'Rotate after cooking pot size reaches the target.',
    targetLabel: 'Pot size',
    targetField: 'potSizeTarget',
    defaultTarget: 1,
    inputmode: 'numeric',
    eligibleSkills: [CookingPowerUpS, CookingPowerUpSMinus],
    requiresCooking: true,
    validateTarget: (target) => (Number.isSafeInteger(target) ? '' : 'Enter a whole number for pot size.')
  }
};

export function isConditionalSchedule(type: TeamScheduleType | undefined): type is ConditionalScheduleType {
  return type !== undefined && Object.hasOwn(conditionalScheduleDefinitions, type);
}

export function getConditionalScheduleDefinition(type: TeamScheduleType | undefined) {
  return isConditionalSchedule(type) ? conditionalScheduleDefinitions[type] : undefined;
}

export function getScheduleTarget(shift: TeamScheduleShift): number | undefined {
  const definition = getConditionalScheduleDefinition(shift.type);
  return definition ? shift[definition.targetField] : undefined;
}

export function withScheduleTarget(
  shift: TeamScheduleShift,
  type: TeamScheduleType,
  target?: number
): TeamScheduleShift {
  const next = { ...shift, type };
  for (const definition of Object.values(conditionalScheduleDefinitions)) delete next[definition.targetField];
  const definition = getConditionalScheduleDefinition(type);
  if (definition && target !== undefined) next[definition.targetField] = target;
  return next;
}

export function validateScheduleTarget(type: TeamScheduleType, target: number): string {
  const definition = getConditionalScheduleDefinition(type);
  if (!definition) return '';
  if (!Number.isFinite(target) || target < 1) return 'Enter a number of at least 1.';
  return definition.validateTarget(target);
}
