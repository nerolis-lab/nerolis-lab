import type { ActivationsType, AmountParams } from '../../mainskill';
import { ModifiedMainskill } from '../../mainskill';
import { BerryBurst } from './berry-burst';

export const BerryBurstDracoMeteor = new (class extends ModifiedMainskill {
  baseSkill = BerryBurst;
  modifierName = 'Draco Meteor';
  RP = [2380, 3385, 4670, 6445, 8898, 12294];
  image = 'berries';

  readonly selfBerryTable: Record<number, number[]> = {
    1: [12, 21, 29, 38, 43, 48], // unique: 1
    2: [14, 24, 29, 39, 44, 50], // unique: 2
    3: [18, 29, 35, 42, 48, 55], // unique: 3
    4: [18, 30, 37, 45, 49, 55], // unique: 4
    5: [20, 33, 41, 49, 53, 58] // unique: 5
  };
  readonly teamBerryTable: Record<number, number[]> = {
    1: [1, 1, 1, 1, 2, 3], // unique: 1
    2: [1, 1, 2, 2, 3, 4], // unique: 2
    3: [1, 1, 2, 3, 4, 4], // unique: 3
    4: [2, 2, 3, 4, 5, 5], // unique: 4
    5: [2, 2, 3, 4, 5, 5] // unique: 5
  };
  latiasBerriesAmounts = [2, 4, 6, 8, 9, 10];

  description = (_params: AmountParams) =>
    'Gets the Berries the Pokémon on your team (including itself) collect. Meet certain conditions to boost effect.';

  activations: ActivationsType = {
    solo: {
      unit: 'berries',
      amount: (params: AmountParams) => this.getSelfBerries(params.skillLevel, params.extra ?? 1, false),
      teamAmount: (params: AmountParams) => this.getTeamBerries(params.skillLevel, params.extra ?? 1)
    },
    paired: {
      unit: 'berries',
      amount: (params: AmountParams) => this.getSelfBerries(params.skillLevel, params.extra ?? 1, true),
      teamAmount: (params: AmountParams) => this.getTeamBerries(params.skillLevel, params.extra ?? 1)
    }
  };

  getSelfBerries(skillLevel: number, unique: number, withLatias: boolean): number {
    const baseAmount = this.selfBerryTable[unique][skillLevel - 1];
    const latiasAmount = withLatias ? this.latiasBerriesAmounts[skillLevel - 1] : 0;
    return baseAmount + latiasAmount;
  }

  getTeamBerries(skillLevel: number, unique: number): number {
    return this.teamBerryTable[unique][skillLevel - 1];
  }
})();
