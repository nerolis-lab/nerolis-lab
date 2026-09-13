import { MathUtils, type Berry, type BerrySet } from 'sleepapi-common';

/** Tracks berry-zone bonuses until the next simulated week. */
export class BerryZoneState {
  private bonuses = new Map<string, number>();

  public bonusPercentage(berry: Berry): number {
    return this.bonuses.get(berry.name) ?? 0;
  }

  public addBonus(berry: Berry, amount: number, maximumBonus: number) {
    this.bonuses.set(berry.name, Math.min(maximumBonus, MathUtils.round(this.bonusPercentage(berry) + amount, 2)));
  }

  public reset() {
    this.bonuses.clear();
  }

  /** Capture the zone at production time, preserving the actual number of berries. */
  public applyBonus(set: BerrySet): BerrySet {
    const bonus = this.bonusPercentage(set.berry);
    return bonus > 0 ? { ...set, berryZoneBonus: bonus } : { ...set };
  }
}
