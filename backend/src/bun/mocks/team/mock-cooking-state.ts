import { teamSettingsExt } from '@src/bun/mocks/team/mock-team-settings.js';
import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state.js';

export function cookingState(provided?: CookingState): CookingState {
  return provided ?? new CookingState(teamSettingsExt());
}
