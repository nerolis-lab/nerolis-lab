import { BERRIES, TOTAL_NUMBER_OF_BERRIES } from '../../types/berry/berries';
import type { Berry, BerrySet } from '../../types/berry/berry';
import type { Pokemon } from '../../types/pokemon/pokemon';
import { MathUtils } from '../math-utils/math-utils';

export const BERRY_ID_LOOKUP: Record<string, number> = Object.fromEntries(
  BERRIES.map((berry, index) => [berry.name, index])
);

export function getBerry(berryName: string): Berry {
  const berry = BERRIES.find((berry) => berry.name.toLowerCase() === berryName.toLowerCase());
  if (!berry) {
    throw new Error(`Berry ${berryName} not found`);
  }
  return berry;
}

export function flatToBerrySet(berries: Float32Array, level: number): BerrySet[] {
  const result: BerrySet[] = emptyBerryInventory();
  for (let i = 0, len = berries.length; i < len; ++i) {
    const amount = berries[i];
    if (amount > 0) {
      result[result.length] = { berry: BERRIES[i], amount, level };
    }
  }
  return result;
}

export function berrySetToFlat(berrySet: BerrySet[]): Float32Array {
  const result = new Float32Array(TOTAL_NUMBER_OF_BERRIES);

  for (const { berry, amount } of berrySet) {
    const index = BERRY_ID_LOOKUP[berry.name];
    result[index] += amount;
  }

  return result;
}

export function berryPowerForLevel(berry: Berry, level: number): number {
  const linearGrowth = berry.value + (level - 1);
  const exponentialGrowth = berry.value * Math.pow(1.025, level - 1);

  return Math.round(Math.max(linearGrowth, exponentialGrowth));
}

// TODO: remove in Sleep api 2?
export function multiplyBerries(berries: BerrySet[], multiplyAmount: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: amount * multiplyAmount, berry, level }));
}

// TODO: remove in Sleep api 2?
export function roundBerries(berries: BerrySet[], precision: number): BerrySet[] {
  return berries.map(({ amount, berry, level }) => ({ amount: MathUtils.round(amount, precision), berry, level }));
}

// TODO: remove in Sleep api 2?
export function emptyBerryInventory(): BerrySet[] {
  return [];
}

// TODO: remove in Sleep api 2?
export function prettifyBerries(berries: BerrySet[], separator = ', '): string {
  return berries.map(({ amount, berry }) => `${MathUtils.round(amount, 1)} ${berry.name}`).join(separator);
}

export function uniqueMembersWithBerry(params: { berry: Berry; members: Pokemon[] }) {
  const { berry, members } = params;
  const { count } = members.reduce(
    (accumulator, cur) => {
      if (cur.berry.name === berry.name && !accumulator.names.has(cur.name)) {
        accumulator.names.add(cur.name);
        accumulator.count += 1;
      }
      return accumulator;
    },
    { count: 0, names: new Set<string>() }
  );
  return count;
}
