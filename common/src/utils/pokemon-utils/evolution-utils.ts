import type { Pokemon } from '../../types/pokemon';
import { nameFromDisplayName } from './pokemon-constructors';

export function evolvesFromWithoutName(previousForm: Pokemon): Pokemon {
  return {
    ...previousForm,
    previousEvolutions: previousForm.previousEvolutions + 1,
    remainingEvolutions: previousForm.remainingEvolutions - 1
  };
}

export function evolvesIntoWithoutName(nextForm: Pokemon): Pokemon {
  return {
    ...nextForm,
    previousEvolutions: nextForm.previousEvolutions - 1,
    remainingEvolutions: nextForm.remainingEvolutions + 1
  };
}

export function evolvesFrom(previousForm: Pokemon, displayName: string): Pokemon {
  return {
    ...previousForm,
    previousEvolutions: previousForm.previousEvolutions + 1,
    remainingEvolutions: previousForm.remainingEvolutions - 1,
    name: nameFromDisplayName(displayName),
    displayName
  };
}

export function evolvesInto(nextForm: Pokemon, displayName: string): Pokemon {
  return {
    ...nextForm,
    previousEvolutions: nextForm.previousEvolutions - 1,
    remainingEvolutions: nextForm.remainingEvolutions + 1,
    name: nameFromDisplayName(displayName),
    displayName
  };
}
