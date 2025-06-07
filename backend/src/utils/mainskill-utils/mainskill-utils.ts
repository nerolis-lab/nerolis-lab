import { MainskillError } from '@src/domain/error/stat/stat-error.js';
import { MAINSKILLS } from 'sleepapi-common';

export function getMainskillNames() {
  return MAINSKILLS.map((ms) => ms.name);
}

export function getMainskill(name: string) {
  const found = MAINSKILLS.find((ms) => ms.name.toLowerCase() === name.toLowerCase());
  if (!found) {
    throw new MainskillError(`Can't find Main skill with name ${name}`);
  }
  return found;
}

/**
 * Converts skill activations to API-safe format
 * @param activations - The activations object from a skill or mainskill
 * @param maxLevel - The maximum level for the skill
 * @returns Converted activations with unit and amounts array
 */
export function convertActivationsToApiFormat(
  activations: Record<string, { amount: (level: number) => number; unit: string }>,
  maxLevel: number
): Record<string, { unit: string; amounts: number[] }> {
  const apiActivations: Record<string, { unit: string; amounts: number[] }> = {};

  for (const [key, activation] of Object.entries(activations)) {
    const amounts: number[] = [];
    for (let level = 1; level <= maxLevel; level++) {
      amounts.push(activation.amount(level));
    }

    apiActivations[key] = {
      unit: activation.unit,
      amounts
    };
  }

  return apiActivations;
}
