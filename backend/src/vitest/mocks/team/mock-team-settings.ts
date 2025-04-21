import { bedtime, wakeup } from '@src/vitest/mocks/time/mock-time.js';
import { commonMocks, type TeamSettingsExt } from 'sleepapi-common';
export function teamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: bedtime(),
    wakeup: wakeup(),
    camp: false,
    includeCooking: false,
    stockpiledIngredients: commonMocks.mockIngredientSetFloatIndexed(),
    potSize: 15,
    ...attrs
  };
}
