import { mocks } from '@src/vitest/index.js';
import { type SolveSettings, type SolveSettingsExt } from 'sleepapi-common';

export function solveSettings(attrs?: Partial<SolveSettings>): SolveSettings {
  return {
    camp: false,
    bedtime: mocks.BEDTIME,
    wakeup: mocks.WAKEUP,
    level: 0,
    stockpiledIngredients: [mocks.mockIngredientSetSimple()],
    island: mocks.islandInstance(),
    ...attrs
  };
}

export function solveSettingsExt(attrs?: Partial<SolveSettingsExt>): SolveSettingsExt {
  return {
    camp: false,
    bedtime: mocks.bedtime(),
    wakeup: mocks.wakeup(),
    level: 0,
    includeCooking: false,
    stockpiledIngredients: mocks.mockIngredientSetFloatIndexed(),
    potSize: 15,
    island: mocks.islandInstance(),
    ...attrs
  };
}
