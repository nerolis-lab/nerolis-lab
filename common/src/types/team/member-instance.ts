import type { PokemonInstanceWithMeta } from '../instance/pokemon-instance';

export interface MemberInstance extends PokemonInstanceWithMeta {
  memberIndex: number;
}
