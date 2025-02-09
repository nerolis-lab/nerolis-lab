<template>
  <v-menu v-model="menu" :close-on-content-click="false" offset-y>
    <template #activator="{ props }">
      <v-btn height="40" class="w-100" v-bind="props" :disabled="singleStageMon">
        <span class="text-body-1">Carry size {{ calculatedCarrySize }}</span>
      </v-btn>
    </template>

    <v-card class="carry-size-card">
      <v-row dense>
        <v-col class="carry-details"> +{{ carryGainFromSubskills }} from subskills </v-col>
        <v-divider vertical v-if="!isMobile"></v-divider>
        <v-col class="carry-details"> +{{ carryGainFromRibbon }} from ribbon </v-col>
      </v-row>
      <v-divider class="ma-2"></v-divider>
      <v-row dense>
        <v-col class="px-3">Times Evolved</v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" class="flex-center" style="overflow: hidden">
          <v-btn-toggle
            v-model="selectedEvolutions"
            class="times-evolved-toggle"
            mandatory
            color="primary"
            rounded="xl"
            base-color="secondary"
          >
            <v-btn v-for="value in stageLabels">{{ value }}</v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { useViewport } from '@/composables/viewport-composable'
import {
  calculateRibbonCarrySize,
  calculateSubskillCarrySize,
  CarrySizeUtils,
  limitSubSkillsToLevel,
  type PokemonInstanceExt
} from 'sleepapi-common'
import type { PropType } from 'vue'

export default {
  name: 'CarrySizeButton',
  props: {
    pokemonInstance: {
      type: Object as PropType<PokemonInstanceExt>,
      required: true
    }
  },
  emits: ['update-carry'],
  data(this: { pokemonInstance: PokemonInstanceExt }) {
    return {
      menu: false,
      selectedEvolutions: CarrySizeUtils.timesEvolvedByCarrySize(
        this.pokemonInstance.pokemon,
        this.pokemonInstance.carrySize
      )
    }
  },
  setup() {
    const { isMobile } = useViewport()
    return { isMobile }
  },
  computed: {
    activeSubskills() {
      const subskills = new Set(this.pokemonInstance.subskills.map((s) => s.subskill.name))

      return limitSubSkillsToLevel(subskills, this.pokemonInstance.level)
    },
    calculatedCarrySize() {
      return CarrySizeUtils.calculateCarrySize({
        baseWithEvolutions: this.pokemonInstance.carrySize,
        subskillsLevelLimited: this.activeSubskills,
        ribbon: this.pokemonInstance.ribbon,
        camp: false
      })
    },
    carryGainFromSubskills() {
      return calculateSubskillCarrySize(this.activeSubskills)
    },
    carryGainFromRibbon() {
      return calculateRibbonCarrySize(this.pokemonInstance.ribbon)
    },
    possibleStages() {
      return this.pokemonInstance.pokemon.previousEvolutions + 1
    },
    stageLabels() {
      return Array.from(Array(this.possibleStages).keys()).reduce(
        (acc, curr) => {
          acc[curr] = curr.toString()
          return acc
        },
        {} as Record<number, string>
      )
    },
    singleStageMon() {
      return this.pokemonInstance.pokemon.previousEvolutions === 0
    },
    pokemon() {
      return this.pokemonInstance.pokemon
    }
  },
  watch: {
    pokemon: {
      handler() {
        this.selectedEvolutions = this.possibleStages - 1
      }
    },
    selectedEvolutions: {
      handler(selection: number) {
        this.menu = false
        this.$emit('update-carry', CarrySizeUtils.baseCarrySize(this.pokemonInstance.pokemon, selection))
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.carry-size-card {
  overflow: hidden;
  padding: 16px 4px;
}

.times-evolved-toggle {
  height: 32px;
  width: 100%;
  margin: 4px 8px 0;
  display: flex;

  button {
    flex: 1 1 60px;
    min-width: unset;

    &:not(:last-of-type) {
      border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }
  }
}

.carry-details {
  display: flex;
  justify-content: center;
  align-items: center;
  font-style: italic;
  font-size: 0.8rem;
  flex: 1 0 111px;
}
</style>
