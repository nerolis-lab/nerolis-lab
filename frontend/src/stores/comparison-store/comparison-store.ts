import { usePokemonStore } from '@/stores/pokemon/pokemon-store'
import { useTeamStore } from '@/stores/team/team-store'
import { defineStore } from 'pinia'
import { DOMAIN_VERSION, type MemberProduction } from 'sleepapi-common'

export interface ComparisonState {
  members: MemberProduction[]
  teamIndex?: number
  timeWindow: '8H' | '24H'
  domainVersion: number
}

const defaultState = (attrs?: Partial<ComparisonState>): ComparisonState => ({
  members: [],
  teamIndex: undefined,
  timeWindow: '24H',
  domainVersion: 0,
  ...attrs
})

const MAX_COMPARISON_MEMBERS = 10

export const useComparisonStore = defineStore('comparison', {
  state: (): ComparisonState => defaultState(),
  getters: {
    getMemberProduction: (state) => (externalId: string) =>
      state.members.find((member) => member.externalId === externalId),
    fullTeam: (state) => state.members.length >= MAX_COMPARISON_MEMBERS,
    currentTeam: (state) => {
      const teamStore = useTeamStore()
      return state.teamIndex != null ? teamStore.teams[state.teamIndex] : undefined
    }
  },
  actions: {
    invalidateCache() {
      if (this.domainVersion !== DOMAIN_VERSION) {
        const updatedKeys = Object.keys(defaultState()) as Array<keyof ComparisonState>
        const cachedKeys = Object.keys(this.$state) as Array<keyof ComparisonState>

        cachedKeys.forEach((key) => {
          if (!updatedKeys.includes(key)) {
            delete this.$state[key]
          }
        })

        this.$patch(defaultState({ domainVersion: DOMAIN_VERSION }))
      }
    },
    addMember(member: MemberProduction) {
      this.members.push(member)
    },
    removeMember(externalId: string, index: number) {
      const pokemonStore = usePokemonStore()
      pokemonStore.removePokemon(externalId, 'compare')
      this.members.splice(index, 1)
    }
  },
  persist: true
})
