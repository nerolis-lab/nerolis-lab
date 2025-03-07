import { teamSettingsExt } from '@src/bun/mocks/team/mock-team-settings.js';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-state.js';
import { defaultUserRecipes } from '@src/services/simulation-service/team-simulator/cooking-state/cooking-utils.js';
import { createPreGeneratedRandom } from '@src/utils/random-utils/pre-generated-random.js';

export function cookingState(provided?: CookingState): CookingState {
  return provided ?? new CookingState(teamSettingsExt(), defaultUserRecipes(), createPreGeneratedRandom());
}
