import { bedtime, wakeup } from '@src/bun/mocks/time/mock-time.js';
import { mockIngredientSetFloatIndexed, type TeamSettingsExt } from 'sleepapi-common';

export function teamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: bedtime(),
    wakeup: wakeup(),
    camp: false,
    includeCooking: false,
    stockpiledIngredients: mockIngredientSetFloatIndexed(),
    potSize: 15,
    ...attrs
  };
}
