import type { PokemonInstanceWithMeta } from '../instance/pokemon-instance';

export type UpsertTeamMemberRequest = PokemonInstanceWithMeta;

export interface UpsertTeamMemberResponse extends PokemonInstanceWithMeta {
  memberIndex: number;
}
