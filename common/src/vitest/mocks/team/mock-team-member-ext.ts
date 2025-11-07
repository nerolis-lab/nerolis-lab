import type { TeamMemberExt } from '../../../types/team/member';
import { pokemonWithIngredients } from '../pokemon/mock-pokemon-with-ingredients';
import { teamMemberSettingsExt } from './mock-team-member-settings-ext';

export function teamMemberExt(attrs?: Partial<TeamMemberExt>): TeamMemberExt {
  return {
    pokemonWithIngredients: pokemonWithIngredients(),
    settings: teamMemberSettingsExt(),
    ...attrs
  };
}
