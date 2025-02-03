import { bedtime, BEDTIME, wakeup, WAKEUP } from '@src/bun/mocks/time/mock-time.js';
import {
  mockIngredientSetFloatIndexed,
  mockIngredientSetSimple,
  type SolveSettings,
  type SolveSettingsExt
} from 'sleepapi-common';

export function solveSettings(attrs?: Partial<SolveSettings>): SolveSettings {
  return {
    camp: false,
    bedtime: BEDTIME,
    wakeup: WAKEUP,
    level: 0,
    stockpiledIngredients: [mockIngredientSetSimple()],
    ...attrs
  };
}

export function solveSettingsExt(attrs?: Partial<SolveSettingsExt>): SolveSettingsExt {
  return {
    camp: false,
    bedtime: bedtime(),
    wakeup: wakeup(),
    level: 0,
    includeCooking: false,
    stockpiledIngredients: mockIngredientSetFloatIndexed(),
    ...attrs
  };
}
