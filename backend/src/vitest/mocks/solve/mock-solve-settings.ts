import { commonMocks, GREENGRASS, type SolveSettings, type SolveSettingsExt } from 'sleepapi-common';

export function solveSettings(attrs?: Partial<SolveSettings>): SolveSettings {
  return {
    camp: false,
    bedtime: commonMocks.BEDTIME,
    wakeup: commonMocks.WAKEUP,
    level: 0,
    stockpiledIngredients: [commonMocks.mockIngredientSetSimple()],
    island: GREENGRASS,
    ...attrs
  };
}

export function solveSettingsExt(attrs?: Partial<SolveSettingsExt>): SolveSettingsExt {
  return {
    camp: false,
    bedtime: commonMocks.bedtime(),
    wakeup: commonMocks.wakeup(),
    level: 0,
    includeCooking: false,
    stockpiledIngredients: commonMocks.mockIngredientSetFloatIndexed(),
    potSize: 15,
    island: GREENGRASS,
    ...attrs
  };
}
