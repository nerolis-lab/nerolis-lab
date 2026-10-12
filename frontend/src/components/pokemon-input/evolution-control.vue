<template>
  <div v-if="candidates.length > 0" class="evolution-control" :class="direction">
    <v-icon v-if="direction === 'next'" size="18" color="surface-variant">{{ arrowIcon }}</v-icon>
    <template v-if="isOverflowing">
      <v-menu v-model="menuOpen" location="bottom">
        <template #activator="{ props }">
          <v-btn icon size="56" color="surface" elevation="0" aria-label="Choose evolution" v-bind="props">
            <v-icon>mdi-help-circle-outline</v-icon>
          </v-btn>
        </template>
        <div class="evolution-picker-grid bg-secondary pa-2">
          <v-btn
            v-for="candidate in candidates"
            :key="candidate.name"
            icon
            :size="buttonSize"
            color="transparent"
            elevation="0"
            :aria-label="candidateLabel(candidate)"
            @click="select(candidate)"
          >
            <v-img :src="thumbnail(candidate)" :width="buttonSize" :height="buttonSize" cover />
          </v-btn>
        </div>
      </v-menu>
    </template>
    <template v-else>
      <v-btn
        v-for="candidate in candidates"
        :key="candidate.name"
        icon
        :size="buttonSize"
        color="transparent"
        elevation="0"
        :aria-label="candidateLabel(candidate)"
        @click="select(candidate)"
      >
        <v-img :src="thumbnail(candidate)" :width="buttonSize" :height="buttonSize" cover />
      </v-btn>
    </template>
    <v-icon v-if="direction === 'previous'" size="18" color="surface-variant">{{ arrowIcon }}</v-icon>
  </div>
</template>

<script lang="ts">
import { PokemonInstanceUtils } from '@/services/utils/pokemon-instance-utils'
import { pokemonImage } from '@/services/utils/image-utils'
import { getPokemon, type Pokemon, type PokemonInstance } from 'sleepapi-common'
import { defineComponent, type PropType } from 'vue'

const MAX_INLINE_CANDIDATES = 2
const DEFAULT_BUTTON_SIZE = 56
const TWO_CANDIDATE_BUTTON_SIZE = 40

export default defineComponent({
  name: 'EvolutionControl',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstance>,
      required: true
    },
    direction: {
      type: String as PropType<'previous' | 'next'>,
      required: true
    }
  },
  emits: ['evolve'],
  data: () => ({
    menuOpen: false
  }),
  computed: {
    candidateNames(): string[] {
      const pokemon = this.pokemonInstance.pokemon
      return this.direction === 'previous' ? (pokemon.evolvesFrom ? [pokemon.evolvesFrom] : []) : pokemon.evolvesInto
    },
    candidates(): Pokemon[] {
      return this.candidateNames.map((name) => getPokemon(name))
    },
    isOverflowing(): boolean {
      return this.candidates.length > MAX_INLINE_CANDIDATES
    },
    buttonSize(): number {
      return this.candidates.length === MAX_INLINE_CANDIDATES ? TWO_CANDIDATE_BUTTON_SIZE : DEFAULT_BUTTON_SIZE
    },
    arrowIcon(): string {
      return this.direction === 'previous' ? 'mdi-arrow-left-bold' : 'mdi-arrow-right-bold'
    }
  },
  methods: {
    candidateLabel(candidate: Pokemon) {
      return `${this.direction === 'previous' ? 'Devolve' : 'Evolve'} into ${candidate.displayName}`
    },
    thumbnail(candidate: Pokemon) {
      return pokemonImage({ pokemonName: candidate.name, shiny: this.pokemonInstance.shiny })
    },
    select(candidate: Pokemon) {
      const evolvedInstance = PokemonInstanceUtils.createPokemonInstanceWithPreservedAttributes(
        candidate,
        this.pokemonInstance
      )
      this.$emit('evolve', evolvedInstance)
      this.menuOpen = false
    }
  }
})
</script>

<style scoped lang="scss">
// vertically centers the control on the PokemonButton image
.evolution-control {
  position: absolute;
  top: 92.5px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
}

.previous {
  right: 62%;
}

.next {
  left: 62%;
}

.evolution-picker-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 200px;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}
</style>
