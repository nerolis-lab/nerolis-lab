<template>
  <v-row dense :class="{ 'flex-column': isMobile }">
    <v-col class="flex-column">
      <v-img
        :src="pokemonDisplayImageUrl"
        height="140"
        contain
        class="mb-2 elevation-3 rounded-lg bg-surface"
        eager
      ></v-img>
      <div class="text-h6 font-weight-medium mt-1">{{ pokemonName }}</div>
      <div class="text-caption text-medium-emphasis">ID: {{ pokemon.pokemonWithSettings.settings.externalId }}</div>
    </v-col>

    <v-col>
      <v-list density="compact" bg-color="transparent" class="overview-list py-0">
        <v-list-item
          rounded="lg"
          v-for="item in listItems"
          :key="item.title"
          :style="{ backgroundColor: item.bgColor }"
          class="mb-2 mx-2"
        >
          <template #prepend>
            <v-icon color="accent" class="mr-3">{{ item.icon }}</v-icon>
          </template>

          <v-list-item-title class="font-weight-bold text-accent">{{ item.title }}</v-list-item-title>
          <v-list-item-subtitle class="list-item-subtitle-value">
            <template v-if="item.title === 'Subskills'">
              <v-row dense class="flex-nowrap flex-center mt-1">
                <v-col v-for="(subskillName, i) in pokemon.pokemonWithSettings.settings.subskills" :key="i">
                  <v-card :color="rarityColor(getSubskill(subskillName))" height="20px" class="text-body-2 text-center">
                    {{ isMobile ? getSubskill(subskillName).shortName : getSubskill(subskillName).shortName }}
                  </v-card>
                </v-col>
              </v-row>
            </template>
            <template v-else>
              {{ item.value }}
            </template>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useBreakpoint } from '@/composables/use-breakpoint/use-breakpoint'
import { rarityColor, withOpacity } from '@/services/utils/color-utils'
import { avatarImage as getPokemonDisplayImageUrlUtil } from '@/services/utils/image-utils'
import { getTierColor } from '@/services/utils/tierlist-utils'
import { getDiffDisplayInfo } from '@/services/utils/ui-utils'
import { getNature, getSubskill, localizeNumber, type PokemonWithTiering } from 'sleepapi-common'
import { computed } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
}>()

const { isMobile } = useBreakpoint()

const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)
const pokemonDisplayImageUrl = computed(() =>
  getPokemonDisplayImageUrlUtil({ pokemonName: pokemonName.value, shiny: false, happy: true })
)

const diffDisplay = getDiffDisplayInfo(props.pokemon.diff)

const listItems = [
  {
    icon: 'mdi-star-circle',
    title: 'Tier',
    value: props.pokemon.tier,
    bgColor: getTierColor(props.pokemon.tier),
    color: `tier-${props.pokemon.tier.toLowerCase()}`
  },
  {
    icon: 'mdi-calculator-variant-outline',
    title: 'Overall Score',
    value: localizeNumber(props.pokemon.score),
    bgColor: withOpacity('secondary', 0.2),
    color: `tier-${props.pokemon.tier.toLowerCase()}`
  },
  {
    icon: 'mdi-chart-line-variant',
    title: 'Rank Change',
    value: diffDisplay.text !== '' ? diffDisplay.text : 'New addition',
    bgColor: withOpacity('secondary', 0.2),
    color: diffDisplay.color
  },
  {
    icon: 'mdi-triangle',
    title: 'Nature',
    value: getNature(props.pokemon.pokemonWithSettings.settings.nature).prettyName,
    bgColor: withOpacity('secondary', 0.2),
    color: `tier-${props.pokemon.tier.toLowerCase()}`
  },
  {
    icon: 'mdi-view-list',
    title: 'Subskills',
    value: '', // Empty value since we'll use custom template
    bgColor: withOpacity('secondary', 0.2),
    color: `tier-${props.pokemon.tier.toLowerCase()}`
  }
]
</script>
