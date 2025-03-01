import type { PokemonInstanceWithMeta } from '../../../domain/instance/pokemon-instance';

export type UpsertTeamMemberRequest = PokemonInstanceWithMeta & {
  isSneakySnacking: boolean;
};

export interface UpsertTeamMemberResponse extends PokemonInstanceWithMeta {
  memberIndex: number;
  isSneakySnacking: boolean;
}
