import type { Nature } from '../../domain/nature';
import { NATURES } from '../../domain/nature';
import { MathUtils } from '../math-utils';

export function getNature(name: string) {
  const nat: Nature | undefined = NATURES.find((nature) => nature.name.toUpperCase() === name.toUpperCase());
  if (!nat) {
    throw new Error("Couldn't find nature with name: " + name.toUpperCase());
  }
  return nat;
}

export function getNatureNames() {
  return NATURES.map((nature) => nature.name);
}

export function invertNatureFrequency(nature: Nature) {
  return MathUtils.round(2 - nature.frequency, 3);
}
