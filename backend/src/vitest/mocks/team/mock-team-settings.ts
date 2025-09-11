import { mocks } from '@src/vitest/index.js';
import { type TeamSettingsExt } from 'sleepapi-common';
export function teamSettingsExt(attrs?: Partial<TeamSettingsExt>): TeamSettingsExt {
  return {
    bedtime: mocks.bedtime(),
    wakeup: mocks.wakeup(),
    camp: false,
    includeCooking: false,
    stockpiledIngredients: mocks.mockIngredientSetFloatIndexed(),
    potSize: 15,
    ...attrs
  };
}
