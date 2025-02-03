import type { PokemonInstanceWithMeta } from '../../../domain/instance/pokemon-instance';

export interface MemberInstance extends PokemonInstanceWithMeta {
  memberIndex: number;
}
