import type { TeamInstance } from '@/types/member/instanced'
import type { PokemonInstanceExt } from 'sleepapi-common'

export interface TeamData extends Omit<TeamInstance, 'members'> {
  members: PokemonInstanceExt[]
}
