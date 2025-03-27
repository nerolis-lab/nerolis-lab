<template>
  <v-card v-if="!pokemonInstance">
    <GroupList
      :data="pokedexStore.groupedPokedex"
      :selected-options="[]"
      @select-option="selectPokemon"
      @cancel="closeMenu"
    />
  </v-card>
  <PokemonInput v-else :pre-selected-pokemon-instance="pokemonInstance" @cancel="closeMenu" />
</template>

<script lang="ts">
import GroupList from '@/components/custom-components/group-list.vue'
import PokemonInput from '@/components/pokemon-input/pokemon-input.vue'
import { randomName } from '@/services/utils/name-utils'
import { usePokedexStore } from '@/stores/pokedex-store/pokedex-store'
import {
  CarrySizeUtils,
  COMPLETE_POKEDEX,
  getRandomGender,
  nature,
  RP,
  uuid,
  type PokemonInstanceExt
} from 'sleepapi-common'

export default {
  name: 'PokemonSearch',
  components: {
    GroupList,
    PokemonInput
  },
  emits: ['cancel'],
  setup() {
    const pokedexStore = usePokedexStore()
    return { pokedexStore }
  },
  data: () => ({
    pokemonInstance: undefined as PokemonInstanceExt | undefined
  }),
  methods: {
    closeMenu() {
      this.$emit('cancel')
    },
    selectPokemon(name: string) {
      const pkmn = COMPLETE_POKEDEX.find((p) => p.displayName.toLowerCase() === name.toLowerCase())
      if (!pkmn) {
        console.error('Error selecting Pokémon')
        return
      }

      const gender = getRandomGender(pkmn)

      const pokemonInstance: PokemonInstanceExt = {
        pokemon: pkmn,
        name: randomName(12, gender),
        level: 60,
        ribbon: 0,
        carrySize: CarrySizeUtils.maxCarrySize(pkmn),
        skillLevel: pkmn.previousEvolutions + 1,
        nature: nature.BASHFUL,
        sneakySnacking: false,
        subskills: [],
        ingredients: [
          { ...pkmn.ingredient0, level: 0 },
          { ...pkmn.ingredient30[0], level: 30 },
          { ...pkmn.ingredient60[0], level: 60 }
        ],
        rp: 0,
        version: 0,
        externalId: uuid.v4(),
        saved: false,
        shiny: false,
        gender
      }
      const rpUtil = new RP(pokemonInstance)
      pokemonInstance.rp = rpUtil.calc()

      this.pokemonInstance = pokemonInstance
    }
  }
}
</script>
