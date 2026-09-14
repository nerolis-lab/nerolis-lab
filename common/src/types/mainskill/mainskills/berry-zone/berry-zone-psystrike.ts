import { Mainskill, type ActivationsType, type AmountParams } from '../../mainskill';

export const BerryZonePsystrike = new (class extends Mainskill {
  name = 'Psystrike (Berry Zone)';
  RP = [2450, 3383, 4733, 6551, 8994, 12028];
  strengthAmounts = [1408, 2002, 2762, 3813, 5264, 7274];
  berryZoneAmounts = [0.6, 0.8, 1, 1.2, 1.6, 2];
  maximumBonus = 24;
  // TODO: Replace the 72x72 icon with a 256x256 version.
  image = 'psystrike';
  description = (params: AmountParams) =>
    `Increases Snorlax's Strength by ${this.activations.strength.amount(params)} and Mago Berry Strength by ${this.activations.berryZone.amount(params)}%, up to ${this.maximumBonus}%. The berry zone remains in effect until moving sites.`;
  activations: ActivationsType = {
    strength: { unit: 'strength', amount: this.leveledAmount(this.strengthAmounts) },
    berryZone: { unit: 'berry zone', amount: this.leveledAmount(this.berryZoneAmounts) }
  };
})();
