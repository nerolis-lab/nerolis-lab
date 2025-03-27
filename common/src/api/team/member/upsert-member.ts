import type { PokemonInstanceWithMeta } from '../../../domain/instance/pokemon-instance';

export type UpsertTeamMemberRequest = PokemonInstanceWithMeta;

export interface UpsertTeamMemberResponse extends PokemonInstanceWithMeta {
  memberIndex: number;
  sneakySnacking: boolean;
}
