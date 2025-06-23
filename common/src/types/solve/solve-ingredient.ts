import type { TeamMemberWithProduce } from '../../types/team/member';
import type { SolveSettings } from '../../types/team/team';

export interface SolveIngredientRequest {
  settings: SolveSettings;
}

export interface SolveIngredientResponse {
  members: TeamMemberWithProduce[];
}
