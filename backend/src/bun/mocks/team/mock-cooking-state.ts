import { CookingState } from '@src/services/simulation-service/team-simulator/cooking-state.js';

export function cookingState(provided?: CookingState): CookingState {
  return provided ?? new CookingState(false);
}
