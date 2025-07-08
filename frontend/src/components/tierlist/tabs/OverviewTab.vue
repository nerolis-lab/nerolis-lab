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
      <div class="text-h6 font-weight-medium mt-1">{{ pokemonDisplayName }}</div>

      <div class="text-small text-medium-emphasis">
        <div class="mb-2">
          <v-icon size="small" class="mr-1">mdi-clock-outline</v-icon>
          <span class="font-weight-medium">Frequency:</span> {{ frequencyDisplay }}
        </div>

        <div class="mb-2">
          <v-icon size="small" class="mr-1">mdi-bag-personal-outline</v-icon>
          <span class="font-weight-medium">Carry size:</span> {{ carrySizeDisplay }}
        </div>

        <div class="mb-2">
          <v-icon size="small" class="mr-1">mdi-ribbon</v-icon>
          <span class="font-weight-medium">Ribbon:</span> {{ ribbonDisplay }}
        </div>

        <div class="mb-2">
          <div class="mb-1">
            <v-icon size="small" class="mr-1">mdi-flash</v-icon>
            <span class="font-weight-medium">Skill ({{ pokemonData.skillPercentage }}%):</span>
            {{ pokemonData.skill.name }}
          </div>
          <div class="ml-6 text-body-2"><span class="font-weight-medium">Level:</span> {{ skillLevelDisplay }}</div>
        </div>

        <div class="mb-2">
          <div class="mb-1">
            <v-icon size="small" class="mr-1">mdi-food-apple</v-icon>
            <span class="font-weight-medium">Ingredients ({{ pokemonData.ingredientPercentage }}%):</span>
          </div>
        </div>
        <v-row dense>
          <v-col v-for="(ingredientOption, i) in ingredientOptions" :key="i" cols="4" class="pa-1">
            <template v-if="ingredientOption.ingredients.length > 3">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="small" variant="outlined" append-icon="mdi-chevron-down">
                    Show All
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item
                    v-for="(ingredient, j) in ingredientOption.ingredients.filter((i) => i.amount > 0)"
                    :key="j"
                    :title="`${ingredient.amount}`"
                  >
                    <template #prepend>
                      <v-avatar size="24">
                        <v-img :src="ingredientImage(ingredient.ingredient.name)" :alt="ingredient.ingredient.name" />
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template v-else>
              <v-text-field
                :label="`Level ${ingredientOption.level === 0 ? 1 : ingredientOption.level}`"
                readonly
                persistent-placeholder
                variant="outlined"
                density="compact"
                hide-details
                style="pointer-events: none"
              >
                <template #prepend-inner>
                  <div v-for="(ingredient, j) in ingredientOption.ingredients" :key="j" class="d-flex align-center">
                    <v-img
                      :src="ingredientImage(ingredient.ingredient.name)"
                      height="16"
                      width="16"
                      :alt="ingredient.ingredient.name"
                      :title="ingredient.ingredient.name"
                    />
                    <span class="text-small">{{
                      `${ingredient.amount}${j < ingredientOption.ingredients.length - 1 ? ',' : ''}`
                    }}</span>
                  </div>
                </template>
              </v-text-field>
            </template>
          </v-col>
        </v-row>
      </div>
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
import { avatarImage as getPokemonDisplayImageUrlUtil, ingredientImage } from '@/services/utils/image-utils'
import { getTierColor } from '@/services/utils/tierlist-utils'
import { TimeUtils } from '@/services/utils/time-utils'
import { getDiffDisplayInfo } from '@/services/utils/ui-utils'
import {
  getNature,
  getPokemon,
  getSubskill,
  localizeNumber,
  type IngredientSet,
  type PokemonWithTiering
} from 'sleepapi-common'
import { computed, ref } from 'vue'

const props = defineProps<{
  pokemon: PokemonWithTiering
}>()

const { isMobile } = useBreakpoint()

const pokemonDisplayName = computed(() => getPokemon(props.pokemon.pokemonWithSettings.pokemon).displayName)
const pokemonName = computed(() => props.pokemon.pokemonWithSettings.pokemon)
const pokemonDisplayImageUrl = computed(() =>
  getPokemonDisplayImageUrlUtil({ pokemonName: pokemonName.value, shiny: false, happy: true })
)

const pokemonData = computed(() => getPokemon(pokemonName.value))

const frequencyDisplay = computed(() => {
  return TimeUtils.prettifySeconds(pokemonData.value.frequency)
})

const carrySizeDisplay = computed(() => {
  return props.pokemon.pokemonWithSettings.settings.carrySize
})

const ribbonDisplay = computed(() => {
  return props.pokemon.pokemonWithSettings.settings.ribbon
})

const skillLevelDisplay = computed(() => {
  return props.pokemon.pokemonWithSettings.settings.skillLevel
})

const ingredientOptions = computed(() => {
  const pokemon = pokemonData.value
  const options: { level: number; ingredients: IngredientSet[] }[] = []

  // Level 0 ingredient
  if (pokemon.ingredient0) {
    options.push({
      level: 0,
      ingredients: pokemon.ingredient0
    })
  }

  // Level 30 ingredients
  if (pokemon.ingredient30) {
    options.push({
      level: 30,
      ingredients: pokemon.ingredient30
    })
  }

  // Level 60 ingredients
  if (pokemon.ingredient60) {
    options.push({
      level: 60,
      ingredients: pokemon.ingredient60
    })
  }

  return options
})

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
    title: 'Score',
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

const showAllIngredients = ref(false)
</script>
